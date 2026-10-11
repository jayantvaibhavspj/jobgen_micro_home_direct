import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import parse, { attributesToProps, domToReact } from "html-react-parser";
import pageMarkup from "./site-content.html?raw";
import "../styles.css";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const featuredModels = [
  {
    name: "3M Micro Pod",
    image: "assets/product-3m-pod.webp",
    alt: "3M Micro Pod product",
    category: "A COMPACT PLACE TO BEGIN",
    price: "$12,800",
    oldPrice: "$13,560"
  },
  {
    name: "4M 13FT Backyard Office",
    image: "assets/product-4m-office.webp",
    alt: "4M 13FT Backyard Office",
    category: "ROOM TO FOCUS",
    price: "$17,500",
    oldPrice: ""
  },
  {
    name: "6M Micro Pod",
    image: "assets/product-6m-pod.webp",
    alt: "6M Micro Pod in a landscaped garden",
    category: "A PLACE TO BEGIN",
    price: "$23,500",
    oldPrice: "$28,800"
  },
  {
    name: "6M 20FT Backyard Office",
    image: "assets/product-6m-office.webp",
    alt: "6M 20FT Backyard Office",
    category: "FLEXIBLE SPACE",
    price: "$23,000",
    oldPrice: ""
  }
];

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia(reducedMotionQuery).matches
  );

  useEffect(() => {
    const media = window.matchMedia(reducedMotionQuery);
    const update = () => setReducedMotion(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

function useScrollEffects(reducedMotion, pageRef) {
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;

    const revealElements = page.querySelectorAll(".reveal, .word-reveal");
    let revealObserver;
    if ("IntersectionObserver" in window && !reducedMotion) {
      revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.14 });
      revealElements.forEach((element) => revealObserver.observe(element));
    } else {
      revealElements.forEach((element) => {
        element.classList.add("is-visible");
      });
    }

    const parallaxElements = page.querySelectorAll("[data-parallax]");
    const marquee = page.querySelector(".marquee-track");
    const transition = page.querySelector(".transition-section");
    let frameRequested = false;

    function updateScrollEffects() {
      if (!reducedMotion) {
        parallaxElements.forEach((element) => {
          const section = element.closest("section");
          if (!section) return;
          const bounds = section.getBoundingClientRect();
          const center = bounds.top + bounds.height / 2;
          const offset = (window.innerHeight / 2 - center) * Number(element.dataset.parallax);
          element.style.transform = `translate3d(0, ${offset}px, 0)`;
        });

        if (transition) {
          const bounds = transition.getBoundingClientRect();
          const progress = Math.min(1, Math.max(0,
            (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)
          ));
          transition.style.setProperty("--transition-progress", progress);
        }

        if (marquee?.parentElement) {
          const bounds = marquee.parentElement.getBoundingClientRect();
          const progress = Math.min(1, Math.max(0,
            (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)
          ));
          marquee.style.setProperty(
            "--marquee-x",
            `${-progress * Math.max(0, marquee.scrollWidth - window.innerWidth) * 0.52}px`
          );
        }
      }
      frameRequested = false;
    }

    function requestScrollUpdate() {
      if (!frameRequested) {
        frameRequested = true;
        window.requestAnimationFrame(updateScrollEffects);
      }
    }

    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    window.addEventListener("resize", requestScrollUpdate);
    updateScrollEffects();

    return () => {
      revealObserver?.disconnect();
      window.removeEventListener("scroll", requestScrollUpdate);
      window.removeEventListener("resize", requestScrollUpdate);
    };
  }, [pageRef, reducedMotion]);
}

function useParticles(pageRef, reducedMotion) {
  useEffect(() => {
    const canvas = pageRef.current?.querySelector("#particles");
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return undefined;

    const particles = [];
    let frameId = 0;

    function resizeCanvas() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * ratio;
      canvas.height = canvas.clientHeight * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles.length = 0;
      const count = Math.min(54, Math.floor(canvas.clientWidth / 22));
      for (let index = 0; index < count; index += 1) {
        particles.push({
          x: Math.random() * canvas.clientWidth,
          y: Math.random() * canvas.clientHeight,
          radius: Math.random() * 1.4 + 0.35,
          speed: Math.random() * 0.22 + 0.06,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    function drawParticles() {
      if (document.hidden) {
        frameId = 0;
        return;
      }

      context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      particles.forEach((particle) => {
        particle.phase += 0.012;
        if (!reducedMotion) particle.y -= particle.speed;
        if (particle.y < -4) particle.y = canvas.clientHeight + 4;
        context.beginPath();
        context.fillStyle = `rgba(166,240,74,${0.18 + (Math.sin(particle.phase) + 1) * 0.2})`;
        context.shadowColor = "#a6f04a";
        context.shadowBlur = 8;
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      });
      context.shadowBlur = 0;
      if (!reducedMotion) frameId = window.requestAnimationFrame(drawParticles);
    }

    function startParticles() {
      if (!reducedMotion && !frameId) frameId = window.requestAnimationFrame(drawParticles);
    }

    resizeCanvas();
    startParticles();
    document.addEventListener("visibilitychange", startParticles);
    window.addEventListener("resize", resizeCanvas);
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      document.removeEventListener("visibilitychange", startParticles);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [pageRef, reducedMotion]);
}

function SiteMarkup({
  menuOpen,
  onMenuToggle,
  onQuoteOpen,
  onSearchOpen,
  gallery,
  onGallerySelect,
  activeFilter,
  onFilterChange,
  featuredIndex,
  onFeaturedChange,
  autoplayPaused,
  onAutoplayToggle,
  reducedMotion,
  quoteDialogRef,
  searchDialogRef,
  quoteModel,
  onQuoteModelChange,
  enquiryNote,
  searchNote
}) {
  const options = useMemo(() => ({
    replace(node) {
      if (!node.attribs) return undefined;

      const props = attributesToProps(node.attribs);
      if (node.name === "img" && node.attribs.id === "hero-feature-image") {
        props.src = featuredModels[featuredIndex].image;
        props.alt = featuredModels[featuredIndex].alt;
        props.fetchPriority = "high";
        delete props.fetchpriority;
        return <img key={featuredIndex} {...props} />;
      }
      if (node.name === "img" && node.attribs.fetchpriority) {
        props.fetchPriority = node.attribs.fetchpriority;
        delete props.fetchpriority;
        return <img {...props} />;
      }
      const children = domToReact(node.children || [], options);
      const classes = node.attribs.class || "";

      if (node.name === "nav" && classes.split(/\s+/).includes("nav-pill")) {
        return (
          <nav {...props} className={`nav-pill${menuOpen ? " open" : ""}`} onClick={(event) => {
            if (event.target.closest("a")) onMenuToggle(false);
          }}>
            {children}
          </nav>
        );
      }

      if (node.name === "a" && node.attribs["data-filter-category"]) {
        return (
          <a
            {...props}
            onClick={() => {
              onFilterChange(node.attribs["data-filter-category"]);
              onMenuToggle(false);
            }}
          >
            {children}
          </a>
        );
      }

      if (node.name === "button" && classes.split(/\s+/).includes("product-filter")) {
        const filter = node.attribs["data-product-filter"];
        return (
          <button
            {...props}
            aria-pressed={activeFilter === filter}
            onClick={() => onFilterChange(filter)}
          >
            {children}
          </button>
        );
      }

      if (node.name === "article" && classes.split(/\s+/).includes("model-card")) {
        if (activeFilter !== "all" && node.attribs["data-category"] !== activeFilter) {
          return <article {...props} style={{ ...props.style, display: "none" }}>{children}</article>;
        }
      }

      if (node.name === "span" && node.attribs.id === "product-count") {
        const labels = {
          pods: ["pod", "pods"],
          homes: ["micro home", "micro homes"],
          containers: ["container home", "container homes"],
          bathroom: ["bathroom pod", "bathroom pods"],
          storage: ["storage & farm product", "storage & farm products"],
          accessories: ["accessory", "accessories"]
        };
        const counts = { all: 9, pods: 4, homes: 1, containers: 1, bathroom: 1, storage: 1, accessories: 1 };
        const message = activeFilter === "all"
          ? `Showing all ${counts.all} featured products`
          : `Showing ${counts[activeFilter]} ${labels[activeFilter][counts[activeFilter] === 1 ? 0 : 1]}`;
        return <span {...props} aria-live="polite">{message}</span>;
      }

      if (node.name === "h2" && node.attribs.id === "hero-feature-name") {
        return <h2 {...props}>{featuredModels[featuredIndex].name}</h2>;
      }

      if (node.name === "p" && node.attribs.id === "hero-eyebrow") {
        return <p {...props}>{`${featuredModels[featuredIndex].name.toUpperCase()} · FEATURED MODEL`}</p>;
      }

      if (node.name === "a" && node.attribs.id === "hero-explore-link") {
        return <a {...props}>Explore the {featuredModels[featuredIndex].name}<span className="button-icon">↗</span></a>;
      }

      if (node.name === "span" && node.attribs.id === "hero-feature-category") {
        return <span {...props}>{featuredModels[featuredIndex].category}</span>;
      }

      if (node.name === "strong" && node.attribs.id === "hero-feature-price") {
        return <strong {...props}>{featuredModels[featuredIndex].price}</strong>;
      }

      if (node.name === "del" && node.attribs.id === "hero-feature-old-price") {
        const oldPrice = featuredModels[featuredIndex].oldPrice;
        return <del {...props} style={oldPrice ? undefined : { display: "none" }}>{oldPrice}</del>;
      }

      if (node.name === "span" && node.attribs.id === "featured-slide-count") {
        return <span {...props}>{`${String(featuredIndex + 1).padStart(2, "0")} / ${String(featuredModels.length).padStart(2, "0")}`}</span>;
      }

      if (node.name === "button" && classes.split(/\s+/).includes("featured-dot")) {
        const index = Number(node.attribs["data-feature-index"]);
        return (
          <button
            {...props}
            aria-pressed={featuredIndex === index}
            onClick={() => onFeaturedChange(index)}
          />
        );
      }

      if (node.name === "button" && classes.split(/\s+/).includes("featured-control")) {
        const direction = node.attribs["data-feature-direction"];
        return (
          <button
            {...props}
            onClick={() => onFeaturedChange(
              (featuredIndex + (direction === "next" ? 1 : -1) + featuredModels.length) % featuredModels.length
            )}
          >
            {children}
          </button>
        );
      }

      if (node.name === "button" && classes.split(/\s+/).includes("featured-autoplay")) {
        return (
          <button
            {...props}
            type="button"
            disabled={reducedMotion}
            aria-label={reducedMotion
              ? "Automatic featured product changes disabled by reduced motion preference"
              : autoplayPaused ? "Resume automatic featured product changes" : "Pause automatic featured product changes"}
            aria-pressed={!autoplayPaused && !reducedMotion}
            title={reducedMotion
              ? "Disabled by reduced motion preference"
              : autoplayPaused ? "Resume slideshow" : "Pause slideshow"}
            onClick={onAutoplayToggle}
          >
            {autoplayPaused || reducedMotion ? "▶" : "Ⅱ"}
          </button>
        );
      }

      if (node.name === "button" && classes.split(/\s+/).includes("round-arrow")) {
        const model = featuredModels[featuredIndex].name;
        return <button {...props} data-model={model} aria-label={`Request a quote for the ${model}`}>{children}</button>;
      }

      if (node.name === "button" && classes.split(/\s+/).includes("menu-toggle")) {
        return (
          <button
            {...props}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            onClick={() => onMenuToggle(!menuOpen)}
          >
            {children}
          </button>
        );
      }

      if (node.name === "dialog" && node.attribs.id === "quote-dialog") {
        return <dialog {...props} ref={quoteDialogRef}>{children}</dialog>;
      }
      if (node.name === "dialog" && node.attribs.id === "search-dialog") {
        return <dialog {...props} ref={searchDialogRef}>{children}</dialog>;
      }

      if (node.name === "img" && node.attribs.id === "gallery-main-image") {
        return <img {...props} src={gallery.src} alt={gallery.alt} />;
      }

      if (node.name === "button" && classes.split(/\s+/).includes("gallery-thumb")) {
        const selected = node.attribs["data-gallery-src"] === gallery.src;
        return (
          <button
            {...props}
            className={`gallery-thumb${selected ? " is-active" : ""}`}
            aria-pressed={selected}
            onClick={() => onGallerySelect({
              src: node.attribs["data-gallery-src"],
              alt: node.attribs["data-gallery-alt"]
            })}
          >
            {children}
          </button>
        );
      }

      if (node.name === "select" && node.attribs.id === "quote-model") {
        return (
          <select {...props} value={quoteModel} onChange={(event) => onQuoteModelChange(event.target.value)}>
            {children}
          </select>
        );
      }

      if (node.name === "span" && node.attribs.id === "year") {
        return <span {...props}>{new Date().getFullYear()}</span>;
      }

      if (node.name === "p" && node.attribs.id === "quote-note") {
        return <p {...props} data-state={enquiryNote ? "ready" : undefined}>{enquiryNote || children}</p>;
      }

      if (node.name === "p" && node.attribs.id === "search-note") {
        return <p {...props}>{searchNote || children}</p>;
      }

      if (node.name === "button" && classes.split(/\s+/).includes("carousel-control")) {
        return (
          <button {...props} onClick={() => {
            const track = document.querySelector(".model-track");
            track?.scrollBy({
              left: node.attribs["data-scroll"] === "right" ? track.clientWidth * 0.78 : -track.clientWidth * 0.78,
              behavior: window.matchMedia(reducedMotionQuery).matches ? "auto" : "smooth"
            });
          }}>
            {children}
          </button>
        );
      }

      if (node.name === "button" && classes.split(/\s+/).includes("modal-close")) {
        return <button {...props} onClick={(event) => event.currentTarget.closest("dialog")?.close()}>{children}</button>;
      }

      if (node.name === "form" && node.attribs.id === "quote-form") {
        return (
          <form {...props} onSubmit={(event) => {
            event.preventDefault();
            if (!event.currentTarget.reportValidity()) return;
            const data = new FormData(event.currentTarget);
            const subject = encodeURIComponent(`Website enquiry: ${data.get("model") || "Micro Homes Direct"}`);
            const body = encodeURIComponent([
              `Name: ${data.get("name")}`,
              `Phone: ${data.get("phone")}`,
              `Email: ${data.get("email")}`,
              `State: ${data.get("state")}`,
              `Model of interest: ${data.get("model") || "Not specified"}`,
              "",
              data.get("message") || "No extra details provided."
            ].join("\n"));
            onQuoteOpen(null, false);
            window.location.href = `mailto:info@microhomesdirect.com.au?subject=${subject}&body=${body}`;
          }}>
            {children}
          </form>
        );
      }

      if (node.name === "form" && node.attribs.id === "search-form") {
        return <form {...props} onSubmit={(event) => {
          event.preventDefault();
          const query = new FormData(event.currentTarget).get("q").trim().toLowerCase();
          onFilterChange("all");
          window.setTimeout(() => {
            const matches = [...document.querySelectorAll(".category-card, .model-card")];
            const target = matches.find((card) => card.textContent.toLowerCase().includes(query));
            if (target) {
              searchDialogRef.current?.close();
              target.scrollIntoView({
                behavior: window.matchMedia(reducedMotionQuery).matches ? "auto" : "smooth",
                block: "center"
              });
              target.classList.add("search-highlight");
              window.setTimeout(() => target.classList.remove("search-highlight"), 1800);
            } else {
              onSearchOpen(true, "No featured match. Try “pod”, “home”, “container” or contact our team.");
            }
          }, 0);
        }}>{children}</form>;
      }

      return undefined;
    }
  }), [
    menuOpen, onMenuToggle, gallery, onGallerySelect, activeFilter, onFilterChange,
    featuredIndex, onFeaturedChange, autoplayPaused, onAutoplayToggle, reducedMotion,
    quoteDialogRef, searchDialogRef,
    quoteModel, onQuoteModelChange, enquiryNote, searchNote, onQuoteOpen, onSearchOpen
  ]);

  return parse(pageMarkup, options);
}

const assistantProducts = [
  { name: "3M Micro Pod", price: "$12,800 AUD", oldPrice: "$13,560 AUD", category: "pods" },
  { name: "4M 13FT Backyard Office", price: "$17,500 AUD", category: "pods" },
  { name: "6M Micro Pod", price: "$23,500 AUD", oldPrice: "$28,800 AUD", category: "pods" },
  { name: "6M 20FT Backyard Office", price: "$23,000 AUD", category: "pods" },
  { name: "30FT Expandable Container Home", category: "containers" },
  { name: "3M Gallery Pod", category: "homes" },
  { name: "Bathroom & Toilet Pod", category: "bathroom" },
  { name: "Storage & Farm Products", category: "storage" },
  { name: "Trailers, Decking & Accessories", category: "accessories" }
];

function getAssistantReply(question) {
  const text = question.trim().toLowerCase().replace(/[’']/g, "");
  const has = (...terms) => terms.some((term) => text.includes(term));
  const hindi = /[\u0900-\u097f]/.test(text) || /\b(kya|ka|ki|ke|hai|hain|mujhe|batao|kitna|kaise|kahan|chahiye|dikhao)\b/.test(text);
  const product = assistantProducts.find((item) => {
    if (text.includes(item.name.toLowerCase())) return true;
    if (item.name.startsWith("3M")) return /\b3m\b/.test(text) && has("pod", "माइक्रो", "micro");
    if (item.name.startsWith("4M")) return /\b4m\b/.test(text) && has("office", "backyard", "ऑफिस");
    if (item.name.startsWith("6M Micro")) return /\b6m\b/.test(text) && has("pod", "पॉड", "माइक्रो", "micro") && !has("office", "backyard");
    if (item.name.startsWith("6M 20FT")) return /\b6m\b/.test(text) && has("office", "backyard", "ऑफिस");
    if (item.name.startsWith("30FT")) return /\b30\s*ft\b/.test(text) && has("container", "home", "घर");
    return false;
  });
  if (!text) return { text: "Type a question and I’ll do my best to help." };
  if (/^(hello|hi|hey|namaste)\b/.test(text) || has("नमस्ते", "हेलो", "हाय")) {
    return { text: hindi
      ? "नमस्ते! 👋 मैं MHD Assistant हूँ। आप products, listed prices, showroom, finance या quote के बारे में पूछ सकते हैं।"
      : "Hi! 👋 I’m the Micro Homes Direct assistant. Ask me about our pods, homes, listed prices, showroom, finance or getting a quote." };
  }
  if (has("thank", "thanks", "धन्यवाद", "शुक्रिया")) {
    return { text: "You’re welcome! 😊 Anything else you’d like to know about Micro Homes Direct?" };
  }
  if (has("bye", "goodbye", "see you", "अलविदा")) {
    return { text: "Thanks for stopping by. Have a lovely day! If you need a hand later, I’ll be here." };
  }
  if (has("who are you", "your name", "bot name", "tum kaun", "aap kaun")) {
    return { text: hindi
      ? "मैं MHD Assistant हूँ—Micro Homes Direct की website का helper. मैं products explore करने और सही जानकारी ढूँढने में मदद कर सकता हूँ।"
      : "I’m MHD Assistant, a website helper for Micro Homes Direct. I can help you explore products and find the right next step." };
  }
  if (has("delivery", "deliver", "shipping", "transport", "when arrive", "डिलीवरी", "kab aayega", "kab milega", "freight", "postcode", "post code")) {
    return { text: hindi
      ? "Delivery का समय और cost model, stock, configuration और आपके location पर निर्भर करते हैं। अपना postcode और model बताकर team से current estimate लें।"
      : "Delivery timing and cost vary by model, stock status, configuration and destination. Contact the team with your postcode and chosen model for a current estimate.",
    action: { label: "Ask about delivery", href: "#contact" } };
  }
  if (product) {
    const pricing = product.price
      ? hindi
        ? ` Website पर इसकी listed price ${product.price}${product.oldPrice ? ` (पहले ${product.oldPrice})` : ""} है।`
        : ` The website currently lists it at ${product.price}${product.oldPrice ? ` (previously ${product.oldPrice})` : ""}.`
      : hindi
        ? " यहाँ इसकी price listed नहीं है; current price और options के लिए team से पूछें।"
        : " A price isn’t listed here, so please ask the team for current pricing and options.";
    return {
      text: hindi
        ? `${product.name} हमारी ${product.category} range में दिखाया गया है।${pricing} Price और availability team से confirm करें।`
        : `${product.name} is shown in our ${product.category} range.${pricing} Prices and availability can change; confirm the latest details with our team.`,
      action: { label: "View product range", href: "#models" }
    };
  }
  if (has("price", "cost", "kitna", "कीमत", "दाम", "rate")) {
    const prices = assistantProducts.filter((item) => item.price)
      .map((item) => `${item.name}: ${item.price}${item.oldPrice ? ` (was ${item.oldPrice})` : ""}.`)
      .join(" ");
    return { text: hindi
      ? `Website पर listed prices: ${prices} ये indicative prices हैं—latest जानकारी team से confirm करें।`
      : `The website lists these prices: ${prices} They’re indicative and should be confirmed with the team.`,
    action: { label: "Browse products", href: "#models" } };
  }
  if (has("compare", "comparison", "difference", "versus", " vs ", "better", "best", "kaunsa", "कौन सा")) {
    return { text: "The best choice depends on how you’ll use the space, the size you need and your site. The catalogue shows product descriptions and listed prices; tell me which two models you’re comparing and I can share the listed details. For exact specifications, ask our team.", action: { label: "Compare in catalogue", href: "#models" } };
  }
  if (has("finance", "loan", "emi", "installment", "instalment", "फाइनेंस", "किस्त")) {
    return { text: "Finance options may be available, subject to the provider’s terms, eligibility, assessment and approval. Visit our finance page for indicative information; the finance provider can confirm your options.", action: { label: "Finance information", href: "https://www.microhomesdirect.au/finance/" } };
  }
  if (has("council", "approval", "permit", "planning", "council approval", "अनुमति")) {
    return { text: "Council and planning requirements depend on your local authority, site and intended use. Please check with your local council and qualified professionals before purchasing. Our team can share product information for your plans." };
  }
  if (has("custom", "customise", "customize", "layout", "finish", "colour", "color", "fit-out", "fitout", "options", "अनुकूल")) {
    return { text: "Options, layouts and finishes depend on the selected model. Tell our team how you plan to use the space and they can confirm what’s available." };
  }
  if (has("warranty", "guarantee", "वारंटी")) {
    return { text: "Warranty terms vary by product. Please request the current warranty information for your chosen model before placing an order." };
  }
  if (has("showroom", "visit", "location", "address", "where", "दुकान", "लोकेशन")) {
    return { text: "We have showroom/location information for Sydney, Gold Coast and Melbourne on the website. Please check the locations section for current addresses and visit details.", action: { label: "Show locations", href: "#locations" } };
  }
  if (has("hour", "open", "opening", "close", "समय", "timing")) {
    return { text: "Showroom hours can vary, so please check the locations section or call 1300 229 166 before visiting.", action: { label: "Show locations", href: "#locations" } };
  }
  if (has("contact", "phone", "call", "email", "quote", "enquiry", "inquiry", "संपर्क", "बात")) {
    return { text: "You can call 1300 229 166, email info@microhomesdirect.com.au, or send a quote enquiry through the website.", action: { label: "Get a quote", quote: true } };
  }
  if (has("product", "category", "catalogue", "catalog", "range", "pod", "home", "container", "bathroom", "storage", "trailer", "decking", "product kya", "क्या बेच")) {
    return { text: "Micro Homes Direct features backyard and office pods, micro homes, expandable container homes, bathroom/toilet pods, storage and farm products, plus trailers, decking and accessories.", action: { label: "Explore products", href: "#categories" } };
  }
  if (has("company", "about", "micro homes direct", "कंपनी", "बारे में")) {
    return { text: "Micro Homes Direct is an Australian compact-living retailer. This website showcases modular pods, micro homes, expandable container homes and related products, with showroom information and quote enquiries." };
  }
  if (has("hello", "how are you", "kaise ho", "कैसे हो")) {
    return { text: "I’m doing well, thanks for asking! 😊 What can I help you find today?" };
  }
  return { text: "I’m not certain about that detail, and I don’t want to guess. I can help with products, listed prices, finance, delivery, council questions, warranty, showroom locations and quotes. You can also call 1300 229 166." };
}

function ChatAssistant({ onQuoteOpen }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, from: "assistant", text: "Hello! 👋 I’m MHD Assistant. Ask me about our products, listed prices, finance or anything else on this website." }
  ]);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const widgetRef = useRef(null);
  const panelRef = useRef(null);
  const messagesRef = useRef(null);
  const dragRef = useRef(null);
  const draggedRef = useRef(false);
  const messageIdRef = useRef(1);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const clampToViewport = useCallback(() => {
    const box = open ? panelRef.current : widgetRef.current;
    if (!box) return;
    const bounds = box.getBoundingClientRect();
    const dx = Math.max(-bounds.left, Math.min(0, window.innerWidth - bounds.right));
    const dy = Math.max(-bounds.top, Math.min(0, window.innerHeight - bounds.bottom));
    if (dx || dy) setOffset((current) => ({ x: current.x + dx, y: current.y + dy }));
  }, [open]);

  useEffect(() => {
    window.addEventListener("resize", clampToViewport);
    const observer = "ResizeObserver" in window ? new ResizeObserver(clampToViewport) : null;
    if (widgetRef.current) observer?.observe(widgetRef.current);
    if (panelRef.current) observer?.observe(panelRef.current);
    return () => {
      window.removeEventListener("resize", clampToViewport);
      observer?.disconnect();
    };
  }, [clampToViewport, open]);

  useEffect(() => () => {
    const drag = dragRef.current;
    if (!drag) return;
    window.removeEventListener("pointermove", drag.moveHandler);
    window.removeEventListener("pointerup", drag.stopHandler);
    window.removeEventListener("pointercancel", drag.stopHandler);
  }, []);

  function sendMessage(event) {
    event.preventDefault();
    const question = draft.trim();
    if (!question) return;
    const reply = getAssistantReply(question);
    messageIdRef.current += 1;
    setMessages((current) => [
      ...current,
      { id: messageIdRef.current, from: "user", text: question },
      { id: messageIdRef.current + 1, from: "assistant", ...reply }
    ]);
    messageIdRef.current += 1;
    setDraft("");
  }

  function startDrag(event) {
    if (event.button !== 0 || event.target.closest(".chat-close")) return;
    const box = open ? panelRef.current : widgetRef.current;
    const bounds = box?.getBoundingClientRect();
    if (!bounds) return;
    draggedRef.current = false;
    const drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: offset,
      bounds: { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom }
    };
    drag.moveHandler = (moveEvent) => {
      if (dragRef.current !== drag || drag.pointerId !== moveEvent.pointerId) return;
      if (Math.abs(moveEvent.clientX - drag.startX) > 4 || Math.abs(moveEvent.clientY - drag.startY) > 4) {
        draggedRef.current = true;
      }
      const dx = Math.max(-drag.bounds.left, Math.min(
        window.innerWidth - drag.bounds.right,
        moveEvent.clientX - drag.startX
      ));
      const dy = Math.max(-drag.bounds.top, Math.min(
        window.innerHeight - drag.bounds.bottom,
        moveEvent.clientY - drag.startY
      ));
      setOffset({ x: drag.startOffset.x + dx, y: drag.startOffset.y + dy });
    };
    drag.stopHandler = (stopEvent) => stopDrag(stopEvent);
    dragRef.current = drag;
    window.addEventListener("pointermove", drag.moveHandler);
    window.addEventListener("pointerup", drag.stopHandler);
    window.addEventListener("pointercancel", drag.stopHandler);
    event.preventDefault();
  }

  function stopDrag(event) {
    const drag = dragRef.current;
    if (drag?.pointerId === event.pointerId) {
      dragRef.current = null;
      window.removeEventListener("pointermove", drag.moveHandler);
      window.removeEventListener("pointerup", drag.stopHandler);
      window.removeEventListener("pointercancel", drag.stopHandler);
    }
  }

  function addSuggestedQuestion(question) {
    setDraft(question);
  }

  return (
    <div
      className={`chat-widget${open ? " is-open" : ""}`}
      ref={widgetRef}
      style={{ "--chat-drag-x": `${offset.x}px`, "--chat-drag-y": `${offset.y}px` }}
      onPointerDown={!open ? startDrag : undefined}
      onPointerUp={!open ? stopDrag : undefined}
      onPointerCancel={!open ? stopDrag : undefined}
    >
      {open ? (
        <section className="chat-panel" ref={panelRef} aria-label="MHD Assistant chat">
          <header
            className="chat-header"
            onPointerDown={startDrag}
            onPointerUp={stopDrag}
            onPointerCancel={stopDrag}
          >
            <img src="/assets/brand-logo.webp" alt="" className="chat-logo" />
            <span className="chat-heading"><strong>MHD Assistant</strong><small>Here to help · Drag to move</small></span>
            <button className="chat-close" type="button" onClick={() => setOpen(false)} aria-label="Minimize chat">−</button>
          </header>
          <div className="chat-messages" ref={messagesRef} role="log" aria-live="polite" aria-label="Chat messages">
            {messages.map((message) => (
              <div className={`chat-message ${message.from}`} key={message.id}>
                <p>{message.text}</p>
                {message.action && (
                  message.action.quote ? (
                    <button className="chat-action" type="button" onClick={() => onQuoteOpen(null)}>{message.action.label} ↗</button>
                  ) : (
                    <a
                      className="chat-action"
                      href={message.action.href}
                      target={message.action.href.startsWith("http") ? "_blank" : undefined}
                      rel={message.action.href.startsWith("http") ? "noreferrer" : undefined}
                      onClick={() => setOpen(false)}
                    >
                      {message.action.label} ↗
                    </a>
                  )
                )}
              </div>
            ))}
          </div>
          <div className="chat-suggestions" aria-label="Suggested questions">
            <button type="button" onClick={() => addSuggestedQuestion("What products do you offer?")}>Products</button>
            <button type="button" onClick={() => addSuggestedQuestion("What are the listed prices?")}>Prices</button>
            <button type="button" onClick={() => addSuggestedQuestion("How do I get a quote?")}>Get a quote</button>
          </div>
          <form className="chat-compose" onSubmit={sendMessage}>
            <label className="sr-only" htmlFor="assistant-message">Message MHD Assistant</label>
            <input
              id="assistant-message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about products, prices..."
              autoComplete="off"
            />
            <button type="submit" aria-label="Send message" disabled={!draft.trim()}>➤</button>
          </form>
          <p className="chat-disclaimer">Website info only. Confirm prices and availability with our team.</p>
        </section>
      ) : (
        <button
          className="chat-launcher"
          type="button"
          onClick={() => {
            if (draggedRef.current) {
              draggedRef.current = false;
              return;
            }
            setOpen(true);
          }}
          aria-label="Open MHD Assistant chat. Drag to move."
        >
          <span className="chat-launcher-mark">
            <img src="/assets/brand-logo.webp" alt="" />
          </span>
          <span className="chat-launcher-label">
            <i aria-hidden="true" />
            <span><strong>MHD Assistant</strong><small>Ask me anything</small></span>
          </span>
          <i className="chat-launcher-status" aria-label="Assistant available" />
        </button>
      )}
    </div>
  );
}

export default function App() {
  const pageRef = useRef(null);
  const quoteDialogRef = useRef(null);
  const searchDialogRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [featuredIndex, setFeaturedIndex] = useState(2);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const [quoteModel, setQuoteModel] = useState("");
  const [gallery, setGallery] = useState({
    src: "assets/pod-6m-01.webp",
    alt: "6M Micro Pod exterior photo 1"
  });
  const [enquiryNote, setEnquiryNote] = useState("");
  const [searchNote, setSearchNote] = useState("");

  useScrollEffects(reducedMotion, pageRef);
  useParticles(pageRef, reducedMotion);

  useEffect(() => {
    if (reducedMotion) setAutoplayPaused(true);
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || autoplayPaused) return undefined;
    const timer = window.setInterval(() => {
      if (!document.hidden) {
        setFeaturedIndex((current) => (current + 1) % featuredModels.length);
      }
    }, 6500);
    return () => window.clearInterval(timer);
  }, [autoplayPaused, reducedMotion]);

  const showSearch = useCallback((open, message = "") => {
    setSearchNote(message);
    const dialog = searchDialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, []);

  const openQuote = useCallback((preset, open = true) => {
    setMenuOpen(false);
    if (preset) {
      const match = [...document.querySelector("#quote-model").options]
        .find((option) => option.textContent.toLowerCase().includes(preset.toLowerCase()));
      if (match) setQuoteModel(match.value);
    }
    if (open && !quoteDialogRef.current?.open) quoteDialogRef.current?.showModal();
    else {
      setEnquiryNote("Enquiry prepared. Your email app should open with the details; send the email there to complete your enquiry. If it doesn't open, contact info@microhomesdirect.com.au.");
    }
  }, []);

  function handlePageClick(event) {
    const quoteButton = event.target.closest(".quote-open");
    if (quoteButton) {
      event.preventDefault();
      openQuote(quoteButton.dataset.model || quoteButton.dataset.interest);
      return;
    }

    if (event.target.closest(".search-button, .nav-search")) {
      setMenuOpen(false);
      showSearch(true);
      return;
    }

    if (event.target.matches("dialog.quote-dialog")) {
      event.target.close();
      return;
    }

    const useRow = event.target.closest(".use-row");
    if (useRow) {
      pageRef.current?.querySelector(".use-preview")?.setAttribute("data-active", useRow.dataset.use);
    }
  }

  function handlePointerMove(event) {
    if (reducedMotion || !window.matchMedia("(pointer: fine)").matches) return;
    const cursorGlow = pageRef.current?.querySelector(".cursor-glow");
    if (cursorGlow) {
      cursorGlow.style.opacity = "1";
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;
    }
    const card = event.target.closest(".partner-card");
    if (card) {
      const bounds = card.getBoundingClientRect();
      card.style.setProperty("--glow-x", `${event.clientX - bounds.left}px`);
      card.style.setProperty("--glow-y", `${event.clientY - bounds.top}px`);
    }
  }

  return (
    <div className="app-shell" ref={pageRef} onClick={handlePageClick} onPointerMove={handlePointerMove}>
      <a className="skip-link" href="#top">Skip to content</a>
      <SiteMarkup
        menuOpen={menuOpen}
        onMenuToggle={setMenuOpen}
        onQuoteOpen={openQuote}
        onSearchOpen={showSearch}
        gallery={gallery}
        onGallerySelect={setGallery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        featuredIndex={featuredIndex}
        onFeaturedChange={setFeaturedIndex}
        autoplayPaused={autoplayPaused}
        onAutoplayToggle={() => setAutoplayPaused((paused) => !paused)}
        reducedMotion={reducedMotion}
        quoteDialogRef={quoteDialogRef}
        searchDialogRef={searchDialogRef}
        quoteModel={quoteModel}
        onQuoteModelChange={setQuoteModel}
        enquiryNote={enquiryNote}
        searchNote={searchNote}
      />
      <ChatAssistant onQuoteOpen={openQuote} />
    </div>
  );
}
