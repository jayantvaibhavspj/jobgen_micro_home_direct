import { dictionary, phraseReplacements } from "./translations.js";

const STORAGE_KEY = "site_language";
let currentLanguage = "en";
let mutationObserver = null;
let isApplyingTranslation = false;
const listeners = new Set();

/**
 * Clean whitespace for consistent key matching
 */
function normalizeKey(str) {
  return str.replace(/\s+/g, " ").trim();
}

/**
 * Translate a single string using exact dictionary, phrases, or sentence decomposition
 */
export function translateText(rawText) {
  if (!rawText || typeof rawText !== "string") return rawText;

  // Don't translate pure numbers, whitespace, or bare punctuation
  const trimmed = rawText.trim();
  if (!trimmed || /^[\d\s.,/\\#!$%^&*;:{}=\-_`~()+-]+$/.test(trimmed)) {
    return rawText;
  }

  // Preserve leading and trailing whitespace
  const leadingSpaceMatch = rawText.match(/^(\s*)/);
  const trailingSpaceMatch = rawText.match(/(\s*)$/);
  const leading = leadingSpaceMatch ? leadingSpaceMatch[1] : "";
  const trailing = trailingSpaceMatch ? trailingSpaceMatch[1] : "";

  const key = normalizeKey(trimmed);

  // 1. Direct dictionary match
  if (dictionary[key]) {
    return leading + dictionary[key] + trailing;
  }

  // 1b. Check without trailing punctuation (e.g. " ↗" or " ↘" or "+")
  const arrowMatch = key.match(/^(.*?)\s*([↗↘→↓←+×])$/);
  if (arrowMatch && dictionary[arrowMatch[1]]) {
    return leading + dictionary[arrowMatch[1]] + " " + arrowMatch[2] + trailing;
  }

  // 2. Pattern replacements
  let translated = trimmed;
  let patternMatched = false;
  for (const [pattern, replacement] of phraseReplacements) {
    if (pattern.test(translated)) {
      translated = translated.replace(pattern, replacement);
      patternMatched = true;
    }
  }
  if (patternMatched) {
    return leading + translated + trailing;
  }

  // 3. Sentence-level translation if multi-sentence
  if (trimmed.includes(". ") || trimmed.includes("! ") || trimmed.includes("? ")) {
    const sentences = trimmed.split(/(?<=[.!?])\s+/);
    if (sentences.length > 1) {
      const translatedSentences = sentences.map((sentence) => {
        const sKey = normalizeKey(sentence);
        return dictionary[sKey] || sentence;
      });
      return leading + translatedSentences.join(" ") + trailing;
    }
  }

  return rawText;
}

/**
 * Translate an element and its children (text nodes, attributes, select options)
 */
function translateElement(el, targetLang) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return;

  // Skip script, style, code, and language buttons themselves
  const tagName = el.tagName.toLowerCase();
  if (["script", "style", "noscript", "svg", "canvas"].includes(tagName)) return;
  if (el.classList.contains("lang-toggle-button") || el.classList.contains("lang-badge")) return;

  // Translate specific attributes
  const translatableAttributes = ["placeholder", "title", "aria-label", "alt"];
  for (const attr of translatableAttributes) {
    if (el.hasAttribute(attr)) {
      const origKey = `orig_${attr}`;
      if (targetLang === "zh") {
        if (!el.dataset[origKey]) {
          el.dataset[origKey] = el.getAttribute(attr);
        }
        const origVal = el.dataset[origKey];
        if (origVal) {
          el.setAttribute(attr, translateText(origVal));
        }
      } else {
        if (el.dataset[origKey] !== undefined) {
          el.setAttribute(attr, el.dataset[origKey]);
          delete el.dataset[origKey];
        }
      }
    }
  }

  // Handle select option text
  if (tagName === "option") {
    if (targetLang === "zh") {
      if (el.__origText === undefined) el.__origText = el.textContent;
      if (el.__origText) el.textContent = translateText(el.__origText);
    } else {
      if (el.__origText !== undefined) {
        el.textContent = el.__origText;
        delete el.__origText;
      }
    }
    return;
  }

  // Translate child text nodes
  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      if (targetLang === "zh") {
        if (child.__origText === undefined) {
          child.__origText = child.nodeValue;
        }
        if (child.__origText && child.__origText.trim()) {
          const trans = translateText(child.__origText);
          if (child.nodeValue !== trans) {
            child.nodeValue = trans;
          }
        }
      } else {
        if (child.__origText !== undefined) {
          child.nodeValue = child.__origText;
          delete child.__origText;
        }
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      translateElement(child, targetLang);
    }
  }
}

/**
 * Apply language ('en' | 'zh') to the entire page
 */
export function applyLanguage(lang) {
  currentLanguage = lang;

  try {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en-AU";
    if (document.body) {
      if (lang === "zh") {
        document.body.classList.add("lang-zh");
        document.body.classList.remove("lang-en");
      } else {
        document.body.classList.add("lang-en");
        document.body.classList.remove("lang-zh");
      }
    }
  } catch (err) {
    console.error("Error setting html/body language attributes", err);
  }

  // Notify listeners
  listeners.forEach((listener) => {
    try {
      listener(lang);
    } catch (e) {
      console.error("Error in language listener", e);
    }
  });
}

/**
 * React natively renders translated markup, so DOM observer is not needed.
 */
export function initLanguageObserver() {
  // Intentionally no-op: native React Virtual DOM rendering avoids race conditions
}

/**
 * Get stored language or default to English
 */
export function getStoredLanguage() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "zh" ? "zh" : "en";
  } catch {
    return "en";
  }
}

/**
 * Store language in localStorage
 */
export function setStoredLanguage(lang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch (error) {
    console.error("Failed to save language in localStorage", error);
  }
}

/**
 * Toggle between English and Chinese
 */
export function toggleLanguage() {
  const nextLang = currentLanguage === "zh" ? "en" : "zh";
  setStoredLanguage(nextLang);
  applyLanguage(nextLang);
  return nextLang;
}

/**
 * Get current active language
 */
export function getCurrentLanguage() {
  return currentLanguage;
}

/**
 * Subscribe to language changes
 */
export function subscribeLanguage(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
