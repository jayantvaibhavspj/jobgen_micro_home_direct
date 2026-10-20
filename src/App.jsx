import { translateMarkup } from "./i18n/markupTranslator.js";
import { dictionary } from "./i18n/translations.js";
import { Children, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import parse, { attributesToProps, domToReact } from "html-react-parser";
import siteShellMarkup from "./site-shell.html?raw";
import homeMarkup from "./pages/home.html?raw";
import shopMarkup from "./pages/shop.html?raw";
import aboutMarkup from "./pages/about.html?raw";
import financeMarkup from "./pages/finance.html?raw";
import contactMarkup from "./pages/contact.html?raw";
import blogMarkup from "./pages/blog.html?raw";
import blogGuideMarkup from "./pages/blog-guide.html?raw";
import modularHomeArticleMarkup from "./pages/blog-modular-home.html?raw";
import expandableHomeArticleMarkup from "./pages/blog-expandable-home.html?raw";
import productMarkup from "./pages/product.html?raw";
import shopCatalog from "./data/shop-catalog.json";
import containerHomeVideo from "../assets/Container_home_video_pan_1080p_20261012214955_gwr_video_mvp.mp4";
import woodenCabinVideo from "../assets/Modern_wooden_modular_cabin_panning_20261012215000_gwr_video_mvp.mp4";
import officePodVideo from "../assets/Modular_pod_office_in_courtyard_20261012215016_gwr_video_mvp.mp4";
import capsulePodVideo from "../assets/Capsule_pod_house_exterior_panning_20261012215023_gwr_video_mvp.mp4";
import gardenHomeVideo from "../assets/Prefabricated_tiny_house_in_garden_20261012215030.mp4";
import "../styles.css";
import {
  getStoredLanguage,
  setStoredLanguage,
  toggleLanguage,
  applyLanguage,
  initLanguageObserver,
  getCurrentLanguage,
  subscribeLanguage,
  translateText
} from "./i18n/translator.js";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

const categoryNamesZh = {
  "pods": "后院与办公太空舱",
  "high-ceiling": "高挑顶微型房屋",
  "container-homes": "双翼拓展集装箱房",
  "toilets": "移动卫浴与洗手间舱",
  "shipping-containers": "集装箱储物房",
  "trailers-accessories": "拖车底盘与配件"
};

const pagePaths = {
  home: "/",
  shop: "/shop",
  about: "/about",
  finance: "/finance",
  contact: "/contact",
  blog: "/blog",
  blogGuide: "/blog/cost-guide",
  blogModularHome: "/blog/what-is-a-modular-home",
  blogExpandableHome: "/blog/expandable-homes",
  productDetail: "/shop"
};
const shopCategoryByFeaturedFilter = {
  pods: "pods",
  homes: "high-ceiling",
  containers: "container-homes",
  bathroom: "toilets",
  storage: "shipping-containers",
  accessories: "trailers-accessories"
};
const featuredFilterByShopCategory = Object.fromEntries(
  Object.entries(shopCategoryByFeaturedFilter).map(([filter, category]) => [category, filter])
);
const cartStorageKey = "micro-homes-direct-cart";
const pageMarkups = {
  home: homeMarkup,
  shop: shopMarkup,
  about: aboutMarkup,
  finance: financeMarkup,
  contact: contactMarkup,
  blog: blogMarkup,
  blogGuide: blogGuideMarkup,
  blogModularHome: modularHomeArticleMarkup,
  blogExpandableHome: expandableHomeArticleMarkup,
  productDetail: productMarkup
};

function getCurrentPage(pathname = window.location.pathname) {
  const path = pathname.toLowerCase().replace(/\/+$/, "") || "/";
  if (path === "/shop" || path.endsWith("/shop.html")) return "shop";
  if (path === "/about" || path.endsWith("/about.html")) return "about";
  if (path === "/finance" || path.endsWith("/finance.html")) return "finance";
  if (path.startsWith("/product/")) return "productDetail";
  if (path === "/contact" || path.endsWith("/contact.html")) return "contact";
  if (path === "/blog/cost-guide") return "blogGuide";
  if (path === "/blog/what-is-a-modular-home") return "blogModularHome";
  if (path === "/blog/expandable-homes") return "blogExpandableHome";
  if (path === "/blog" || path.endsWith("/blog.html")) return "blog";
  return "home";
}

function resolveRouteHref(href, page) {
  if (!href) return href;
  if (href.startsWith("#")) return resolveInternalHref(href, page);
  return href.replace(/^\/index\.html(?=[?#]|$)/i, "/")
    .replace(/^\/shop\.html(?=[?#]|$)/i, "/shop")
    .replace(/^\/products\.html(?=[?#]|$)/i, "/products")
    .replace(/^\/about\.html(?=[?#]|$)/i, "/about")
    .replace(/^\/contact\.html(?=[?#]|$)/i, "/contact")
    .replace(/^\/blog\.html(?=[?#]|$)/i, "/blog");
}

function resolveInternalHref(href, page) {
  if (!href?.startsWith("#")) return href;
  const target = href.slice(1);
  const targetPage = {
    categories: "shop",
    models: "shop",
    why: "about",
    finance: "finance",
    locations: "contact",
    faq: "contact",
    contact: "contact"
  }[target];
  if (!targetPage) return href;
  if (target === "finance" || target === "contact") return pagePaths[targetPage];
  if (targetPage === page) return href;
  return `${pagePaths[targetPage]}${href}`;
}

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

const heroVideos = [
  { src: containerHomeVideo, label: "Container home" },
  { src: woodenCabinVideo, label: "Modern wooden cabin" },
  { src: officePodVideo, label: "Modular pod office" },
  { src: capsulePodVideo, label: "Capsule pod home" },
  { src: gardenHomeVideo, label: "Tiny home in a garden" }
];

function setHeroVideoPlaybackRate(video) {
  if (video) video.playbackRate = 0.6;
}

const searchBackgroundImages = shopCatalog.products
  .filter((product) => product.image)
  .filter((product) => !/^(?:3m-micro-pod|4m-micro-pod|4m-13ft-backyard-office|6m-micro-pod|6m20ft-backyard-office)(?:-|$)/i.test(product.slug))
  .map((product) => product.image);

function SearchBackdrop({ index, previousIndex, className = "search-backdrop" }) {
  return (
    <div className={className} aria-hidden="true">
      {[...new Set([previousIndex, index].filter((imageIndex) => imageIndex !== null))].map((imageIndex) => (
        <img
          key={imageIndex}
          className={imageIndex === index ? "is-visible" : "is-leaving"}
          src={searchBackgroundImages[imageIndex]}
          alt=""
        />
      ))}
    </div>
  );
}

function HeroVideoBackground({ videoIndex, onVideoEnded, paused, reducedMotion }) {
  const videoRefs = useRef([]);
  const activeLayerRef = useRef(-1);
  const [activeLayer, setActiveLayer] = useState(-1);
  const [fadingLayer, setFadingLayer] = useState(null);

  useEffect(() => {
    const currentLayer = activeLayerRef.current;
    const nextLayer = currentLayer === 0 ? 1 : 0;
    const nextVideo = videoRefs.current[nextLayer];
    if (!nextVideo) return undefined;

    let cancelled = false;
    let loaded = false;
    const activateNextVideo = () => {
      if (loaded) return;
      loaded = true;
      nextVideo.removeEventListener("loadeddata", activateNextVideo);
      if (cancelled) return;

      nextVideo.playbackRate = 0.6;
      setFadingLayer(currentLayer >= 0 ? currentLayer : null);
      activeLayerRef.current = nextLayer;
      setActiveLayer(nextLayer);
    };

    nextVideo.pause();
    nextVideo.src = heroVideos[videoIndex].src;
    nextVideo.addEventListener("error", handleLoadError, { once: true });
    nextVideo.load();

    if (nextVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      activateNextVideo();
    } else {
      nextVideo.addEventListener("loadeddata", activateNextVideo);
    }

    return () => {
      cancelled = true;
      nextVideo.removeEventListener("loadeddata", activateNextVideo);
      nextVideo.removeEventListener("error", handleLoadError);
    };

    function handleLoadError() {
      nextVideo.removeEventListener("loadeddata", activateNextVideo);
      console.error(`Hero background video failed to load: ${heroVideos[videoIndex].src}`);
    }
  }, [videoIndex]);

  useEffect(() => {
    const activeVideo = videoRefs.current[activeLayer];
    if (!activeVideo) return;
    const inactiveVideo = videoRefs.current[activeLayer === 0 ? 1 : 0];
    if (paused || reducedMotion) {
      activeVideo.pause();
      inactiveVideo?.pause();
      return;
    }

    const playPromise = activeVideo.play();
    if (playPromise) {
      playPromise.catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Hero background video failed to play.", error);
        }
      });
    }
  }, [activeLayer, paused, reducedMotion]);

  const handleVideoEnded = (event) => {
    if (event.currentTarget === videoRefs.current[activeLayerRef.current]) {
      onVideoEnded();
    }
  };

  const handleFadeComplete = (event, layer) => {
    if (event.propertyName === "opacity" && layer === fadingLayer) {
      event.currentTarget.pause();
      setFadingLayer(null);
    }
  };

  return (
    <div className="hero-backdrop">
      {[0, 1].map((layer) => (
        <video
          key={layer}
          ref={(element) => { videoRefs.current[layer] = element; }}
          className={`hero-backdrop-video${activeLayer === layer ? " is-active" : ""}${fadingLayer === layer ? " is-fading-out" : ""}`}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          onEnded={handleVideoEnded}
          onTransitionEnd={(event) => handleFadeComplete(event, layer)}
        />
      ))}
    </div>
  );
}

function TransitionVideoGallery({
  videoIndex,
  onSelect,
  paused,
  onTogglePaused,
  reducedMotion
}) {
  const videoRefs = useRef([]);

  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (!video) return;
      if (paused || reducedMotion) {
        video.pause();
        return;
      }
      video.playbackRate = 0.6;
      const playPromise = video.play();
      if (playPromise) {
        playPromise.catch((error) => {
          if (error.name !== "AbortError") {
            console.error("Transition video preview failed to play.", error);
          }
        });
      }
    });
  }, [paused, reducedMotion]);

  return (
    <div className="transition-image transition-video-gallery">
      <div className="transition-preview-track" role="group" aria-label="Home video previews">
        {heroVideos.map((item, index) => (
          <button
            key={item.src}
            className={`transition-preview-tile${videoIndex === index ? " is-active" : ""}`}
            type="button"
            aria-label={`Show ${item.label}`}
            aria-pressed={videoIndex === index}
            onClick={() => onSelect(index)}
          >
            <video
              ref={(element) => { videoRefs.current[index] = element; }}
              src={item.src}
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              onError={() => console.error(`Transition video preview failed to load: ${item.src}`)}
            />
          </button>
        ))}
      </div>
      <button
        className="transition-video-toggle"
        type="button"
        aria-label={paused ? "Resume hero video sequence" : "Pause hero video sequence"}
        aria-pressed={!paused}
        title={paused ? "Resume video sequence" : "Pause video sequence"}
        disabled={reducedMotion}
        onClick={onTogglePaused}
      >
        {paused || reducedMotion ? "▶" : "Ⅱ"}
      </button>
    </div>
  );
}

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

function useScrollEffects(reducedMotion, pageRef, pageKey) {
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

    const featureCarousel = page.querySelector("[data-feature-carousel]");
    const featureSlides = Array.from(featureCarousel?.querySelectorAll("[data-feature-slide]") || []);
    let carouselTimer;
    let carouselObserver;
    let carouselEventController;
    let carouselVisible = !("IntersectionObserver" in window);
    let carouselFocused = false;
    let carouselManuallyPaused = reducedMotion;
    let activeFeatureIndex = 0;

    if (featureCarousel && featureSlides.length) {
      carouselEventController = new AbortController();
      const listenerOptions = { signal: carouselEventController.signal };
      const previousButton = featureCarousel.querySelector("[data-feature-prev]");
      const nextButton = featureCarousel.querySelector("[data-feature-next]");
      const toggleButton = featureCarousel.querySelector("[data-feature-toggle]");

      function updateFeatureCarousel() {
        const compactLayout = window.matchMedia("(max-width: 760px)").matches;
        const narrowLayout = window.matchMedia("(max-width: 520px)").matches;
        const visibleOffset = compactLayout ? 1 : 2;
        const slideGap = compactLayout
          ? 12
          : Math.min(28, Math.max(18, window.innerWidth * 0.02));
        const galleryWidth = Math.min(1600, window.innerWidth);
        const slideWidth = compactLayout
          ? Math.min(150, Math.max(112, window.innerWidth * 0.33))
          : Math.min(360, (galleryWidth - slideGap * 4) / 5);
        featureSlides.forEach((slide, index) => {
          const relativeIndex = (index - activeFeatureIndex + featureSlides.length) % featureSlides.length;
          const offset = relativeIndex > featureSlides.length / 2
            ? relativeIndex - featureSlides.length
            : relativeIndex;
          const distance = Math.abs(offset);
          slide.style.setProperty("--carousel-width", `${slideWidth}px`);
          slide.style.setProperty("--carousel-x", `${offset * (slideWidth + slideGap)}px`);
          slide.style.setProperty("--carousel-angle", "0deg");
          slide.style.setProperty("--carousel-scale", distance === 0 ? "1.18" : distance === 1 ? "0.9" : "0.82");
          slide.style.setProperty("--carousel-depth", String(featureSlides.length - distance));
          slide.dataset.carouselPosition = distance === 0 ? "active" : distance <= visibleOffset ? "near" : "hidden";
          slide.setAttribute("aria-hidden", String(distance > visibleOffset));
          slide.setAttribute("aria-label", `${index + 1} of ${featureSlides.length}: ${slide.querySelector("h3")?.textContent.trim() || "Feature"}`);
        });
      }

      function syncCarouselTimer() {
        const shouldPlay = carouselVisible && !carouselFocused && !carouselManuallyPaused && !document.hidden;
        if (shouldPlay && !carouselTimer) {
          carouselTimer = window.setInterval(() => {
            activeFeatureIndex = (activeFeatureIndex + 1) % featureSlides.length;
            updateFeatureCarousel();
          }, 3600);
        } else if (!shouldPlay && carouselTimer) {
          window.clearInterval(carouselTimer);
          carouselTimer = undefined;
        }
        if (toggleButton) {
          toggleButton.dataset.paused = String(carouselManuallyPaused);
          toggleButton.setAttribute("aria-label", carouselManuallyPaused ? "Play feature gallery" : "Pause feature gallery");
          toggleButton.setAttribute("aria-pressed", String(carouselManuallyPaused));
        }
      }

      function showPreviousFeature() {
        activeFeatureIndex = (activeFeatureIndex - 1 + featureSlides.length) % featureSlides.length;
        updateFeatureCarousel();
      }

      function showNextFeature() {
        activeFeatureIndex = (activeFeatureIndex + 1) % featureSlides.length;
        updateFeatureCarousel();
      }

      function handleCarouselVisibility() {
        carouselVisible = !document.hidden;
        syncCarouselTimer();
      }

      function handleCarouselResize() {
        updateFeatureCarousel();
      }

      const handleCarouselFocusIn = () => {
        carouselFocused = true;
        syncCarouselTimer();
      };
      const handleCarouselFocusOut = (event) => {
        if (!featureCarousel.contains(event.relatedTarget)) {
          carouselFocused = false;
          syncCarouselTimer();
        }
      };
      const handleToggleCarousel = () => {
        carouselManuallyPaused = !carouselManuallyPaused;
        syncCarouselTimer();
      };

      previousButton?.addEventListener("click", showPreviousFeature, listenerOptions);
      nextButton?.addEventListener("click", showNextFeature, listenerOptions);
      toggleButton?.addEventListener("click", handleToggleCarousel, listenerOptions);
      featureCarousel.addEventListener("focusin", handleCarouselFocusIn, listenerOptions);
      featureCarousel.addEventListener("focusout", handleCarouselFocusOut, listenerOptions);
      document.addEventListener("visibilitychange", handleCarouselVisibility, listenerOptions);
      window.addEventListener("resize", handleCarouselResize, listenerOptions);

      if ("IntersectionObserver" in window) {
        carouselObserver = new IntersectionObserver(([entry]) => {
          carouselVisible = entry.isIntersecting;
          syncCarouselTimer();
        });
        carouselObserver.observe(featureCarousel);
      }
      featureCarousel.classList.add("is-ready");
      updateFeatureCarousel();
      syncCarouselTimer();
    }

    const parallaxElements = page.querySelectorAll("[data-parallax]");
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
      carouselObserver?.disconnect();
      carouselEventController?.abort();
      if (carouselTimer) window.clearInterval(carouselTimer);
      window.removeEventListener("scroll", requestScrollUpdate);
      window.removeEventListener("resize", requestScrollUpdate);
    };
  }, [pageRef, reducedMotion, pageKey]);
}

function useParticles(pageRef, reducedMotion, pageKey) {
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
  }, [pageRef, reducedMotion, pageKey]);
}

function FinanceCalculatorFrame() {
  return (
    <iframe
      src="https://main.d3no9537k411us.amplifyapp.com/"
      title="Micro Homes Direct finance repayment calculator"
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}

function loadCartItems() {
  try {
    const storedItems = JSON.parse(window.localStorage.getItem(cartStorageKey) || "[]");
    if (!Array.isArray(storedItems)) return [];
    return storedItems.filter((item) => (
      shopCatalog.products.some((product) => product.slug === item.slug)
      && Number.isInteger(item.quantity)
      && item.quantity > 0
    ));
  } catch (error) {
    console.error("Unable to load the saved cart.", error);
    return [];
  }
}

function ProductDetail({ product, onAddToCart, currentLang }) {
  const isZh = currentLang === "zh";
  const [activeImage, setActiveImage] = useState(0);
  const category = shopCatalog.categories.find(({ slug }) => slug === product.category);
  const catLabel = isZh ? (categoryNamesZh[product.category] || category?.label) : (category?.label || "Products");
  const prodName = isZh ? (dictionary[product.name] || product.name) : product.name;
  const gallery = product.gallery?.length
    ? product.gallery
    : [product.image || category?.image].filter(Boolean);
  const relatedProducts = shopCatalog.products
    .filter((item) => item.category === product.category && item.slug !== product.slug)
    .slice(0, 4);

  return (
    <div className="product-detail-page">
      <nav className="product-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">{isZh ? "首页" : "Home"}</Link><span aria-hidden="true">/</span>
        <Link to="/shop">{isZh ? "商城" : "Shop"}</Link><span aria-hidden="true">/</span>
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{catLabel}</Link>
        <span aria-hidden="true">/</span><span aria-current="page">{prodName}</span>
      </nav>

      <section className="product-detail-hero">
        <div className="product-detail-gallery">
          <div className="product-detail-main-image">
            {gallery[activeImage] && <img src={gallery[activeImage]} alt={prodName} fetchPriority="high" />}
          </div>
          {gallery.length > 1 && (
            <div className="product-detail-thumbnails" aria-label="Product images">
              {gallery.map((image, index) => (
                <button
                  className={activeImage === index ? "is-active" : ""}
                  key={`${image}-${index}`}
                  type="button"
                  aria-label={`Show product image ${index + 1}`}
                  aria-pressed={activeImage === index}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={image} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-detail-summary">
          <p className="eyebrow"><Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{catLabel}</Link></p>
          <h1>{prodName}</h1>
          <p className="product-detail-price">{product.price}<span>{isZh ? "AUD · 标示价格" : "AUD · Listed price"}</span></p>
          <p className="product-detail-description">{isZh ? (dictionary[product.description] || product.description) : (product.description || "Contact our team for product specifications, current availability and delivery information.")}</p>
          <div className="product-detail-actions">
            <button className="cart-add-button cart-add-button--detail" type="button" onClick={() => onAddToCart(product.slug)}>
              {isZh ? "加入购物车" : "Add to cart"}
            </button>
            <button className="button quote-open" type="button" data-interest={product.name}>
              {isZh ? "咨询此产品" : "Enquire about this product"} <span className="button-icon">↗</span>
            </button>
            <a className="product-detail-phone" href="tel:1300229166">{isZh ? "拨打电话 1300 229 166" : "Call 1300 229 166"}</a>
          </div>
          <p className="product-detail-disclaimer">{isZh ? "价格和在售情况可能发生变动。下单前请与团队确认具体细节。" : "Prices and availability may change. Confirm final details with our team before ordering."}</p>
        </div>
      </section>

      {product.detailsLoadError && (
        <p className="product-detail-load-error" role="alert">
          Product information could not be loaded. The current listed product details are shown above. Please contact our team if you need more information.
        </p>
      )}

      {product.details?.length > 0 && (
        <section className="product-detail-information" aria-label={`${product.name} details`}>
          <p className="eyebrow">PRODUCT INFORMATION</p>
          <h2>Made for <em>the way you live.</em></h2>
          <div className="product-detail-sections">
            {product.details.map((section, index) => (
              <article className="product-detail-section" key={`${section.heading}-${index}`}>
                <h3>{section.heading}</h3>
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph}</p>
                ))}
                {section.items.length > 0 && (
                  <ul>
                    {section.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section className="product-related-products" aria-label="Related products">
          <div className="product-related-heading">
            <div><p className="eyebrow">EXPLORE THE COLLECTION</p><h2>More in <em>{category?.label || "this range"}.</em></h2></div>
            <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>View category ↗</Link>
          </div>
          <div className="shop-product-grid">
            {relatedProducts.map((item) => (
              <article className="shop-product-card" key={item.slug}>
                <Link className="shop-product-image" to={item.localUrl} aria-label={`View ${item.name}`}>
                  <img src={item.image || category?.image} alt={item.name} loading="lazy" />
                  <span className="shop-product-link" aria-hidden="true">↗</span>
                </Link>
                <div className="shop-product-info">
                  <p className="shop-product-category">{category?.label}</p>
                  <h3><Link to={item.localUrl}>{item.name}</Link></h3>
                  <div className="shop-product-price"><strong>{item.price}</strong><span>AUD</span></div>
                  <button className="cart-add-button" type="button" onClick={() => onAddToCart(item.slug)}>
                    Add to cart
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ProductDetailRoute({
  onAddToCart,
  cartItems,
  cartOpen,
  onCartOpen,
  onCartClose,
  onCartQuantityChange,
  onCartRemove
}) {
  const { slug } = useParams();
  const product = shopCatalog.products.find((item) => item.slug === slug);
  const [details, setDetails] = useState(null);
  const [detailsLoadError, setDetailsLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    setDetails(null);
    setDetailsLoadError(false);

    import("./data/product-details.json")
      .then(({ default: productDetails }) => {
        if (active) setDetails(productDetails[slug] || { description: "", details: [] });
      })
      .catch(() => {
        if (active) setDetailsLoadError(true);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (!product) return <Navigate to="/shop" replace />;
  if (!details && !detailsLoadError) {
    return (
      <SiteApp
        page="productDetail"
        onAddToCart={onAddToCart}
        cartItems={cartItems}
        cartOpen={cartOpen}
        onCartOpen={onCartOpen}
        onCartClose={onCartClose}
        onCartQuantityChange={onCartQuantityChange}
        onCartRemove={onCartRemove}
        product={{ ...product, description: "Loading product information…", details: [] }}
      />
    );
  }
  return (
    <SiteApp
      page="productDetail"
      onAddToCart={onAddToCart}
      cartItems={cartItems}
      cartOpen={cartOpen}
      onCartOpen={onCartOpen}
      onCartClose={onCartClose}
      onCartQuantityChange={onCartQuantityChange}
      onCartRemove={onCartRemove}
      product={{
        ...product,
        ...(details || { description: "", details: [] }),
        detailsLoadError
      }}
    />
  );
}

function ShopCatalog({ onAddToCart, currentLang }) {
  const isZh = currentLang === "zh";
  const [searchParams, setSearchParams] = useSearchParams();
  const queryCategory = searchParams.get("category");
  const [activeCategory, setActiveCategory] = useState(() => (
    shopCatalog.categories.some(({ slug }) => slug === queryCategory) ? queryCategory : "all"
  ));
  const visibleProducts = activeCategory === "all"
    ? shopCatalog.products
    : shopCatalog.products.filter((product) => product.category === activeCategory);
  const activeCategoryInfo = shopCatalog.categories.find(({ slug }) => slug === activeCategory);

  useEffect(() => {
    setActiveCategory(
      shopCatalog.categories.some(({ slug }) => slug === queryCategory) ? queryCategory : "all"
    );
  }, [queryCategory]);

  function selectCategory(category) {
    setActiveCategory(category);
    const nextParams = new URLSearchParams(searchParams);
    if (category === "all") nextParams.delete("category");
    else nextParams.set("category", category);
    setSearchParams(nextParams, { replace: true, preventScrollReset: true });
  }

  return (
    <section className="shop-catalog section-pad" id="models" aria-label="Shop products and categories">
      <div className="shop-category-picker" id="shop-product-catalog">
        <div className="shop-category-heading">
          <p className="eyebrow">{isZh ? "寻找您的理想空间" : "FIND YOUR FIT"}</p>
          <h2>{isZh ? <>契合您崭新生活篇章的<em>理想空间。</em></> : <>Space that fits <em>your next chapter.</em></>}</h2>
          <p>{isZh ? "从专注工作空间到灵活起居与仓储，探索全系产品并向我们咨询切合您规划的各项细节。" : "From focused workspaces to flexible living and storage, explore the range and ask us about the details that matter to your plans."}</p>
        </div>
        <p className="eyebrow">{isZh ? "按类别选购" : "SHOP BY CATEGORY"}</p>
        <div className="shop-category-grid" role="group" aria-label="Product categories">
          {shopCatalog.categories.map((category) => (
            <button
              className={`shop-category-card${activeCategory === category.slug ? " is-active" : ""}`}
              key={category.slug}
              type="button"
              aria-pressed={activeCategory === category.slug}
              onClick={() => selectCategory(category.slug)}
            >
              <span className="shop-category-image">
                <img src={category.image} alt="" loading="lazy" />
              </span>
              <span className="shop-category-details">
                <span>{isZh ? (categoryNamesZh[category.slug] || category.label) : category.label}</span>
                <small>{category.count} {isZh ? "款产品" : "products"}</small>
              </span>
              <span className="shop-category-arrow" aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
        <button
          className={`shop-all-button${activeCategory === "all" ? " is-active" : ""}`}
          type="button"
          aria-pressed={activeCategory === "all"}
          onClick={() => selectCategory("all")}
        >
          {isZh ? `查看全部 ${shopCatalog.products.length} 款产品` : `View all ${shopCatalog.products.length} products`} <span aria-hidden="true">↗</span>
        </button>
      </div>

      <div className="shop-products" id="shop-products">
        <div className="shop-products-heading">
          <div>
            <p className="eyebrow">{activeCategoryInfo ? (isZh ? (categoryNamesZh[activeCategoryInfo.slug] || activeCategoryInfo.label) : activeCategoryInfo.label) : (isZh ? "完整产品系列" : "THE FULL COLLECTION")}</p>
            <h2>{activeCategoryInfo ? (isZh ? (categoryNamesZh[activeCategoryInfo.slug] || activeCategoryInfo.label) : activeCategoryInfo.label) : (isZh ? "全部产品" : "All products")}</h2>
          </div>
          <p className="shop-results-count" aria-live="polite">
            {isZh ? `${visibleProducts.length} 款产品` : `${visibleProducts.length} ${visibleProducts.length === 1 ? "product" : "products"}`}
          </p>
        </div>
        {activeCategoryInfo && (
          <p className="shop-category-intro">{activeCategoryInfo.intro}</p>
        )}
        <div className="shop-product-grid">
          {visibleProducts.map((product) => (
            <article className="shop-product-card" key={`${product.category}-${product.name}`}>
              <Link
                className="shop-product-image"
                to={product.localUrl}
                aria-label={`View ${product.name}`}
              >
                <img src={product.image || shopCatalog.categories.find(({ slug }) => slug === product.category)?.image} alt={product.name} loading="lazy" />
                <span className="shop-product-link" aria-hidden="true">↗</span>
              </Link>
              <div className="shop-product-info">
                <p className="shop-product-category">
                  {shopCatalog.categories.find(({ slug }) => slug === product.category)?.label}
                </p>
                <h3><Link to={product.localUrl}>{product.name}</Link></h3>
                <div className="shop-product-price">
                  <strong>{product.price}</strong>
                  <span>AUD</span>
                </div>
                <button className="cart-add-button" type="button" onClick={() => onAddToCart(product.slug)}>
                  {isZh ? "加入购物车" : "Add to cart"}
                </button>
              </div>
            </article>
          ))}
        </div>
        <p className="shop-price-note">
          Prices and availability are shown as listed on Micro Homes Direct and may change. Confirm details with the team before ordering.
        </p>
      </div>
    </section>
  );
}

function CartDrawer({ items, onClose, onQuantityChange, onRemove, currentLang }) {
  const isZh = currentLang === "zh";
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  const cartProducts = items
    .map(({ slug, quantity }) => ({
      product: shopCatalog.products.find((item) => item.slug === slug),
      quantity
    }))
    .filter(({ product }) => product);
  const itemCount = cartProducts.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartProducts.reduce((total, { product, quantity }) => {
    const price = Number.parseFloat(product.price.replace(/[^0-9.]/g, ""));
    return total + (Number.isFinite(price) ? price * quantity : 0);
  }, 0);

  return (
    <div className="cart-overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className="cart-drawer-heading">
          <div>
            <p className="eyebrow">{isZh ? "您的选购" : "YOUR SELECTION"}</p>
            <h2 id="cart-title">{isZh ? "购物车" : "Shopping cart"} <span>({itemCount})</span></h2>
          </div>
          <button className="cart-close" type="button" aria-label="Close cart" onClick={onClose}>×</button>
        </div>
        {cartProducts.length === 0 ? (
          <div className="cart-empty">
            <p>{isZh ? "您的购物车是空的。" : "Your cart is empty."}</p>
            <button className="cart-continue-button" type="button" onClick={onClose}>{isZh ? "继续选购" : "Continue shopping"}</button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartProducts.map(({ product, quantity }) => (
                <article className="cart-item" key={product.slug}>
                  <Link className="cart-item-image" to={product.localUrl} onClick={onClose}>
                    <img src={product.image || shopCatalog.categories.find(({ slug }) => slug === product.category)?.image} alt="" />
                  </Link>
                  <div className="cart-item-details">
                    <Link to={product.localUrl} onClick={onClose}>{product.name}</Link>
                    <strong>{product.price} AUD</strong>
                    <div className="cart-item-controls">
                      <div className="cart-quantity" aria-label={`Quantity for ${product.name}`}>
                        <button type="button" aria-label={`Decrease quantity of ${product.name}`} onClick={() => onQuantityChange(product.slug, quantity - 1)}>−</button>
                        <span>{quantity}</span>
                        <button type="button" aria-label={`Increase quantity of ${product.name}`} onClick={() => onQuantityChange(product.slug, quantity + 1)}>+</button>
                      </div>
                      <button className="cart-remove" type="button" onClick={() => onRemove(product.slug)}>{isZh ? "移除" : "Remove"}</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="cart-drawer-footer">
              <div className="cart-subtotal"><span>{isZh ? "商品小计" : "Listed subtotal"}</span><strong>${subtotal.toLocaleString("en-AU", { maximumFractionDigits: 2 })} AUD</strong></div>
              <p>{isZh ? "配送费和最终价格将在下单前由团队为您确认。" : "Delivery and final pricing are confirmed with our team before ordering."}</p>
              <Link className="button cart-contact-button" to="/contact" onClick={onClose}>{isZh ? "联系团队咨询购物车" : "Contact us about your cart"} <span className="button-icon">↗</span></Link>
              <button className="cart-continue-button" type="button" onClick={onClose}>{isZh ? "继续选购" : "Continue shopping"}</button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}


function LanguageSegmentedSwitch({ currentLang, onChangeLanguage, id, className = "" }) {
  const isZh = currentLang === "zh";

  return (
    <div
      className={`lang-segmented-switch ${isZh ? "is-zh" : "is-en"} ${className}`}
      id={id}
      role="group"
      aria-label="Language selection"
    >
      <div
        className="lang-switch-track"
        onClick={() => onChangeLanguage(isZh ? "en" : "zh")}
        title={isZh ? "Switch to English / 切换为英文" : "Switch to Chinese / 切换为中文"}
      >
        <span className="lang-switch-slider" aria-hidden="true" />
        <button
          type="button"
          className={`lang-switch-btn lang-switch-en ${!isZh ? "is-active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onChangeLanguage("en");
          }}
          aria-pressed={!isZh}
          aria-label="English"
        >
          EN
        </button>
        <button
          type="button"
          className={`lang-switch-btn lang-switch-zh ${isZh ? "is-active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onChangeLanguage("zh");
          }}
          aria-pressed={isZh}
          aria-label="中文 (Chinese)"
        >
          中文
        </button>
      </div>
    </div>
  );
}

function SiteMarkup({
  page,
  product,
  onAddToCart,
  onCartOpen,
  cartCount,
  onQuoteOpen,
  onSearchOpen,
  onSearchNavigate,
  searchOpen,
  searchBackgroundIndex,
  previousSearchBackgroundIndex,
  gallery,
  onGallerySelect,
  activeFilter,
  onFilterChange,
  heroVideoIndex,
  onHeroVideoChange,
  heroVideoPaused,
  onHeroVideoTogglePaused,
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
  searchNote,
  currentLang,
  onToggleLanguage
}) {
  const options = useMemo(() => ({
    replace(node) {
      if (!node.attribs) return undefined;

      const props = attributesToProps(node.attribs);
      if (node.name === "div" && node.attribs.id === "route-page-content") {
        const rawPage = pageMarkups[page] || "";
        const effectivePage = currentLang === "zh" ? translateMarkup(rawPage, "zh") : rawPage;
        return <>{parse(effectivePage, options)}</>;
      }
      if (node.name === "div" && node.attribs.id === "search-background") {
        return <SearchBackdrop index={searchBackgroundIndex} previousIndex={previousSearchBackgroundIndex} />;
      }
      if (node.name === "div" && node.attribs.id === "faq-background") {
        return <SearchBackdrop index={searchBackgroundIndex} previousIndex={previousSearchBackgroundIndex} className="search-backdrop faq-backdrop" />;
      }
      if (node.name === "div" && node.attribs.id === "shop-product-catalog") {
        return <ShopCatalog onAddToCart={onAddToCart} currentLang={currentLang} />;
      }
      if (node.name === "div" && node.attribs.id === "finance-calculator-embed") {
        return <FinanceCalculatorFrame />;
      }
      if (node.name === "div" && node.attribs.id === "product-detail-mount") {
        return <ProductDetail product={product} onAddToCart={onAddToCart} currentLang={currentLang} />;
      }

      if (
        (node.name === "div" || node.name === "button") &&
        ((node.attribs.class || "").split(/\s+/).includes("lang-segmented-switch") ||
         (node.attribs.class || "").split(/\s+/).includes("lang-toggle-button"))
      ) {
        return (
          <LanguageSegmentedSwitch
            currentLang={currentLang}
            onChangeLanguage={(targetLang) => onToggleLanguage(targetLang)}
            id={props.id}
            className={props.className}
          />
        );
      }

      if (["a", "button"].includes(node.name) && (node.attribs.class || "").split(/\s+/).includes("cart-button")) {
        if (cartCount === 0) return <></>;

        return (
          <button
            className={node.attribs.class}
            type="button"
            aria-label={`Open cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
            onClick={onCartOpen}
          >
            {domToReact(node.children || [], options)}
            {cartCount > 0 && <span className="cart-count-badge" aria-hidden="true">{cartCount}</span>}
          </button>
        );
      }

      if (node.name === "a" && node.attribs.href?.startsWith("#")) {
        props.href = resolveRouteHref(node.attribs.href, page);
      } else if (node.name === "a") {
        props.href = resolveRouteHref(node.attribs.href, page);
      }

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

      if (page === "home" && node.name === "div" && classes.split(/\s+/).includes("hero-backdrop")) {
        return (
          <HeroVideoBackground
            videoIndex={heroVideoIndex}
            onVideoEnded={() => onHeroVideoChange((heroVideoIndex + 1) % heroVideos.length)}
            paused={heroVideoPaused}
            reducedMotion={reducedMotion}
          />
        );
      }

      if (page === "home" && node.name === "div" && classes.split(/\s+/).includes("transition-image")) {
        return (
          <TransitionVideoGallery
            videoIndex={heroVideoIndex}
            onSelect={onHeroVideoChange}
            paused={heroVideoPaused}
            onTogglePaused={onHeroVideoTogglePaused}
            reducedMotion={reducedMotion}
          />
        );
      }

      if (page === "home" && node.name === "div" && classes.split(/\s+/).includes("widget-stat")) {
        return <></>;
      }

      if (node.name === "a" && node.attribs["data-filter-category"]) {
        const category = shopCategoryByFeaturedFilter[node.attribs["data-filter-category"]];
        props.href = `${pagePaths.shop}?category=${encodeURIComponent(category)}#shop-product-catalog`;
        const { href, ...linkProps } = props;
        return <Link {...linkProps} to={href}>{children}</Link>;
      }

      if (node.name === "a" && props.href?.startsWith("/") && !props.href.startsWith("//")) {
        const { href, ...linkProps } = props;
        return <Link {...linkProps} to={href}>{children}</Link>;
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
        const name = featuredModels[featuredIndex].name;
        return <h2 {...props}>{currentLang === "zh" ? (dictionary[name] || name) : name}</h2>;
      }

      if (node.name === "p" && node.attribs.id === "hero-eyebrow") {
        return <p {...props}>{currentLang === "zh" ? "灵活微居空间 · 专为美好生活打造" : "FLEXIBLE SPACES · MADE FOR REAL LIFE"}</p>;
      }

      if (node.name === "a" && node.attribs.id === "hero-explore-link") {
        const { href, ...linkProps } = props;
        return <Link {...linkProps} to={href}>{currentLang === "zh" ? "探索所有系列" : "Explore our range"}<span className="button-icon">↗</span></Link>;
      }

      if (node.name === "span" && node.attribs.id === "hero-feature-category") {
        const cat = featuredModels[featuredIndex].category;
        return <span {...props}>{currentLang === "zh" ? (dictionary[cat] || cat) : cat}</span>;
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
        const hasQuoteModelOption = Children.toArray(children).some((option) => (
          String(option.props.value ?? option.props.children) === quoteModel
        ));
        return (
          <select {...props} value={quoteModel} onChange={(event) => onQuoteModelChange(event.target.value)}>
            {quoteModel && !hasQuoteModelOption && <option value={quoteModel}>{quoteModel}</option>}
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

      if (node.name === "select" && node.attribs.id === "site-search") {
        return (
          <select {...props} defaultValue="">
            <option value="">Choose a category or product</option>
            {shopCatalog.categories.map((category) => (
              <optgroup label={category.label} key={category.slug}>
                <option value={`category:${category.slug}`}>All {category.label}</option>
                {shopCatalog.products
                  .filter((item) => item.category === category.slug)
                  .map((item) => (
                    <option value={`product:${item.localUrl}`} key={item.slug}>{item.name}</option>
                  ))}
              </optgroup>
            ))}
          </select>
        );
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
        return <button {...props} onClick={(event) => {
          const dialog = event.currentTarget.closest("dialog");
          dialog?.close();
          if (dialog?.id === "search-dialog") onSearchOpen(false);
        }}>{children}</button>;
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
          const selection = new FormData(event.currentTarget).get("q");
          if (typeof selection !== "string") return;
          if (selection.startsWith("category:")) {
            onSearchNavigate(`/shop?category=${encodeURIComponent(selection.slice("category:".length))}`);
          } else if (selection.startsWith("product:")) {
            onSearchNavigate(selection.slice("product:".length));
          }
        }}>{children}</form>;
      }

      if (node.name === "dialog" && node.attribs.id === "search-dialog") {
        return <dialog {...props} onClose={() => onSearchOpen(false)}>{children}</dialog>;
      }

      if (node.name === "a" && !/^(?:https?:|mailto:|tel:|javascript:)/i.test(props.href || "")) {
        const { href, ...linkProps } = props;
        return <Link {...linkProps} to={href}>{children}</Link>;
      }

      return undefined;
    }
  }), [
    page, product, onAddToCart, onCartOpen, cartCount,
    gallery, onGallerySelect, activeFilter, onFilterChange,
    heroVideoIndex, onHeroVideoChange, heroVideoPaused, onHeroVideoTogglePaused,
    featuredIndex, onFeaturedChange, autoplayPaused, onAutoplayToggle, reducedMotion,
    quoteDialogRef, searchDialogRef,
    quoteModel, onQuoteModelChange, enquiryNote, searchNote, onQuoteOpen, onSearchOpen, onSearchNavigate,
    searchOpen, searchBackgroundIndex, previousSearchBackgroundIndex,
    currentLang, onToggleLanguage
  ]);

  const effectiveShell = currentLang === "zh" ? translateMarkup(siteShellMarkup, "zh") : siteShellMarkup;
  return parse(effectiveShell, options);
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
  const chinese = /[\u4e00-\u9fff]/.test(text) || getCurrentLanguage() === "zh";
  const product = assistantProducts.find((item) => {
    if (text.includes(item.name.toLowerCase())) return true;
    if (item.name.startsWith("3M")) return (/\b3m\b/.test(text) || text.includes("3米")) && has("pod", "माइक्रो", "micro", "舱", "太空舱");
    if (item.name.startsWith("4M")) return (/\b4m\b/.test(text) || text.includes("4米")) && has("office", "backyard", "ऑफिस", "办公");
    if (item.name.startsWith("6M Micro")) return (/\b6m\b/.test(text) || text.includes("6米")) && has("pod", "पॉड", "माइक्रो", "micro", "舱", "太空舱") && !has("office", "backyard", "办公");
    if (item.name.startsWith("6M 20FT")) return (/\b6m\b/.test(text) || text.includes("6米")) && has("office", "backyard", "ऑफिस", "办公");
    if (item.name.startsWith("30FT")) return (/\b30\s*ft\b/.test(text) || text.includes("30英尺") || text.includes("双翼")) && has("container", "home", "घर", "集装箱", "拓展");
    return false;
  });
  if (!text) return { text: chinese ? "请输入您的问题，我将竭诚为您解答。" : "Type a question and I’ll do my best to help." };
  if (/^(hello|hi|hey|namaste|你好|您好)\b/.test(text) || has("नमस्ते", "हेलो", "हाय", "你好", "您好", "早上好", "下午好")) {
    return { text: chinese
      ? "您好！👋 我是 Micro Homes Direct 智能助手。随时问我关于太空舱、微型房屋、在售价格、展厅、金融分期或报价的问题。"
      : hindi
        ? "नमस्ते! 👋 मैं MHD Assistant हूँ। आप products, listed prices, showroom, finance या quote के बारे में पूछ सकते हैं।"
        : "Hi! 👋 I’m the Micro Homes Direct assistant. Ask me about our pods, homes, listed prices, showroom, finance or getting a quote." };
  }
  if (has("thank", "thanks", "धन्यवाद", "शुक्रिया", "谢谢", "多谢", "感谢")) {
    return { text: chinese
      ? "不客气！😊 关于 Micro Homes Direct，还有什么我可以帮您的吗？"
      : "You’re welcome! 😊 Anything else you’d like to know about Micro Homes Direct?" };
  }
  if (has("bye", "goodbye", "see you", "अलविदा", "再见", "拜拜")) {
    return { text: chinese
      ? "感谢您的光临，祝您度过愉快的一天！如果之后需要帮助，我一直在这里。"
      : "Thanks for stopping by. Have a lovely day! If you need a hand later, I’ll be here." };
  }
  if (has("who are you", "your name", "bot name", "tum kaun", "aap kaun", "你是谁", "你的名字", "叫什么")) {
    return { text: chinese
      ? "我是 MHD 智能助手——Micro Homes Direct 官方网站的专属顾问帮手。我可以帮您了解各类太空舱、微型房产品并解答疑问。"
      : hindi
        ? "मैं MHD Assistant हूँ—Micro Homes Direct की website का helper. मैं products explore करने और सही जानकारी ढूँढने में मदद कर सकता हूँ।"
        : "I’m MHD Assistant, a website helper for Micro Homes Direct. I can help you explore products and find the right next step." };
  }
  if (has("delivery", "deliver", "shipping", "transport", "when arrive", "डिलीवरी", "kab aayega", "kab milega", "freight", "postcode", "post code", "送货", "配送", "运输", "多久到", "运费")) {
    return { text: chinese
      ? "配送交付时间与运费取决于产品型号、库存状态、选装配置以及您的送达地址。欢迎提供您的邮政编码及所选型号，团队将为您提供最新预估。"
      : hindi
        ? "Delivery का समय और cost model, stock, configuration और आपके location पर निर्भर करते हैं। अपना postcode और model बताकर team से current estimate लें।"
        : "Delivery timing and cost vary by model, stock status, configuration and destination. Contact the team with your postcode and chosen model for a current estimate.",
    action: { label: chinese ? "咨询配送详情" : "Ask about delivery", href: "#contact" } };
  }
  if (product) {
    const pricing = product.price
      ? chinese
        ? ` 网站当前标价为 ${product.price}${product.oldPrice ? ` (原价 ${product.oldPrice})` : ""}。`
        : hindi
          ? ` Website पर इसकी listed price ${product.price}${product.oldPrice ? ` (पहले ${product.oldPrice})` : ""} है।`
          : ` The website currently lists it at ${product.price}${product.oldPrice ? ` (previously ${product.oldPrice})` : ""}.`
      : chinese
        ? " 此处未公开标价，请向团队咨询最新在售价格与选配方案。"
        : hindi
          ? " यहाँ इसकी price listed नहीं है; current price और options के लिए team से पूछें।"
          : " A price isn’t listed here, so please ask the team for current pricing and options.";
    return {
      text: chinese
        ? `${product.name} 展示在我们的 ${product.category} 系列中。${pricing} 价格与现货库存可能变动，请向团队确认最新信息。`
        : hindi
          ? `${product.name} हमारी ${product.category} range में दिखाया गया है।${pricing} Price और availability team से confirm करें।`
          : `${product.name} is shown in our ${product.category} range.${pricing} Prices and availability can change; confirm the latest details with our team.`,
      action: { label: chinese ? "查看产品系列" : "View product range", href: "/shop#models" }
    };
  }
  if (has("price", "cost", "kitna", "कीमत", "दाम", "rate", "多少钱", "价格", "造价", "费用", "多少")) {
    const prices = assistantProducts.filter((item) => item.price)
      .map((item) => `${item.name}: ${item.price}${item.oldPrice ? ` (was ${item.oldPrice})` : ""}.`)
      .join(" ");
    return { text: chinese
      ? `网站当前参考标价：${prices} 这些价格仅供参考，请向销售团队确认最新优惠与现货价格。`
      : hindi
        ? `Website पर listed prices: ${prices} ये indicative prices हैं—latest जानकारी team से confirm करें।`
        : `The website lists these prices: ${prices} They’re indicative and should be confirmed with the team.`,
    action: { label: chinese ? "浏览全部产品" : "Browse products", href: "/shop#models" } };
  }
  if (has("compare", "comparison", "difference", "versus", " vs ", "better", "best", "kaunsa", "कौन सा", "对比", "区别", "哪款好")) {
    return {
      text: chinese
        ? "最佳选择取决于您的具体用途、所需空间尺寸以及现场场地条件。在售型录展示了产品规格与标价，告诉我您在对比哪两款型号，我可为您提供比对信息。"
        : "The best choice depends on how you’ll use the space, the size you need and your site. The catalogue shows product descriptions and listed prices; tell me which two models you’re comparing and I can share the listed details. For exact specifications, ask our team.",
      action: { label: chinese ? "在型录中对比" : "Compare in catalogue", href: "/shop#models" }
    };
  }
  if (has("finance", "loan", "emi", "installment", "instalment", "फाइनेंस", "किस्त", "贷款", "分期", "分期付款", "金融")) {
    return {
      text: chinese
        ? "可提供金融分期方案，具体取决于金融机构条款、资质评估与审批。欢迎访问我们的金融分期页面了解参考方案。"
        : "Finance options may be available, subject to the provider’s terms, eligibility, assessment and approval. Visit our finance page for indicative information; the finance provider can confirm your options.",
      action: { label: chinese ? "了解金融分期" : "Finance information", href: "/finance" }
    };
  }
  if (has("council", "approval", "permit", "planning", "council approval", "अनुमति", "审批", "市政", "许可")) {
    return {
      text: chinese
        ? "市政（Council）与规划审批要求取决于您当地政府、场地条件与使用规划。购买前请咨询当地市政厅及专业建筑规划人士，我们的团队可为您提供产品申报技术参数。"
        : "Council and planning requirements depend on your local authority, site and intended use. Please check with your local council and qualified professionals before purchasing. Our team can share product information for your plans."
    };
  }
  if (has("custom", "customise", "customize", "layout", "finish", "colour", "color", "fit-out", "fitout", "options", "अनुकूल", "定制", "布局", "选配", "颜色")) {
    return {
      text: chinese
        ? "定制选项、内部格局及材质选配取决于所选具体型号。告诉我们您的实际需求，团队将为您确认可用选装方案。"
        : "Options, layouts and finishes depend on the selected model. Tell our team how you plan to use the space and they can confirm what’s available."
    };
  }
  if (has("warranty", "guarantee", "वारंटी", "保修", "质保")) {
    return {
      text: chinese
        ? "质保条款因产品型号而异。下单前请向销售团队索取所选型号的具体质保细则。"
        : "Warranty terms vary by product. Please request the current warranty information for your chosen model before placing an order."
    };
  }
  if (has("showroom", "visit", "location", "address", "where", "दुकान", "लोकेशन", "展厅", "地址", "参观", "哪里", "地点")) {
    return {
      text: chinese
        ? "我们在悉尼、黄金海岸与墨尔本设有展厅与仓储服务中心。请查看展示中心板块了解详细地址与预约参观方式。"
        : "We have showroom/location information for Sydney, Gold Coast and Melbourne on the website. Please check the locations section for current addresses and visit details.",
      action: { label: chinese ? "查看展示网点" : "Show locations", href: "#locations" }
    };
  }
  if (has("hour", "open", "opening", "close", "समय", "timing", "营业时间", "开放时间", "上班时间")) {
    return {
      text: chinese
        ? "展厅开放时间可能因预约而调整，参观前请查看展示中心板块或致电 1300 229 166 提前预约。"
        : "Showroom hours can vary, so please check the locations section or call 1300 229 166 before visiting.",
      action: { label: chinese ? "查看展示网点" : "Show locations", href: "#locations" }
    };
  }
  if (has("contact", "phone", "call", "email", "quote", "enquiry", "inquiry", "संपर्क", "बात", "联系", "电话", "邮箱", "报价", "咨询")) {
    return {
      text: chinese
        ? "您可以致电 1300 229 166，发送邮件至 info@microhomesdirect.com.au，或直接在网站提交在线报价咨询。"
        : "You can call 1300 229 166, email info@microhomesdirect.com.au, or send a quote enquiry through the website.",
      action: { label: chinese ? "获取报价" : "Get a quote", quote: true }
    };
  }
  if (has("product", "category", "catalogue", "catalog", "range", "pod", "home", "container", "bathroom", "storage", "trailer", "decking", "product kya", "क्या बेच", "产品", "买什么", "卖什么")) {
    return {
      text: chinese
        ? "Micro Homes Direct 提供后院与办公太空舱、高挑顶微型房、双翼拓展集装箱房、移动卫浴、仓储仓房以及拖车露台配件等丰富系列。"
        : "Micro Homes Direct features backyard and office pods, micro homes, expandable container homes, bathroom/toilet pods, storage and farm products, plus trailers, decking and accessories.",
      action: { label: chinese ? "探索全部产品" : "Explore products", href: "#categories" }
    };
  }
  if (has("company", "about", "micro homes direct", "कंपनी", "बारे में", "公司", "介绍")) {
    return {
      text: chinese
        ? "Micro Homes Direct 是一家澳大利亚领先的紧凑型微居与太空舱品牌零售商。本网站展示模块化太空舱、微型房屋、拓展集装箱房及配件，支持展厅预约与报价咨询。"
        : "Micro Homes Direct is an Australian compact-living retailer. This website showcases modular pods, micro homes, expandable container homes and related products, with showroom information and quote enquiries."
    };
  }
  if (has("hello", "how are you", "kaise ho", "कैसे हो", "你好吗", "近来好吗")) {
    return { text: chinese ? "我很好，谢谢关心！😊 今天有什么我可以协助您的吗？" : "I’m doing well, thanks for asking! 😊 What can I help you find today?" };
  }
  return {
    text: chinese
      ? "抱歉，我还不太确定该细节，不想向您提供不确切的猜测。我可以帮您解答产品、在售标价、金融分期、配送运送、市政审批、质保及展厅预约等问题。您也可以直接致电 1300 229 166。"
      : "I’m not certain about that detail, and I don’t want to guess. I can help with products, listed prices, finance, delivery, council questions, warranty, showroom locations and quotes. You can also call 1300 229 166."
  };
}


function ChatAssistant({ onQuoteOpen, page, currentLang }) {
  const isZh = currentLang === "zh";
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(() => [
    {
      id: 1,
      from: "assistant",
      text: isZh
        ? "您好！👋 我是 MHD 智能助手。随时问我关于产品、在售价格、金融分期或网站上的任何信息。"
        : "Hello! 👋 I’m MHD Assistant. Ask me about our products, listed prices, finance or anything else on this website."
    }
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
            <span className="chat-avatar" aria-hidden="true"><img src="/assets/brand-logo.webp" alt="" /></span>
            <span className="chat-heading">
              <strong>MHD Assistant</strong>
              <small><i aria-hidden="true" /> Online · Drag to move</small>
            </span>
            <button className="chat-close" type="button" onClick={() => setOpen(false)} aria-label="Minimize chat">−</button>
          </header>
          <div className="chat-messages" ref={messagesRef} role="log" aria-live="polite" aria-label="Chat messages">
            {messages.map((message) => (
              <div className={`chat-message ${message.from}`} key={message.id}>
                <p>{message.text}</p>
                {message.action?.quote ? (
                  <button className="chat-action" type="button" onClick={() => onQuoteOpen(null)}>{message.action.label} ↗</button>
                ) : message.action && (/^https?:/i.test(message.action.href) ? (
                  <a
                    className="chat-action"
                    href={message.action.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setOpen(false)}
                  >
                    {message.action.label} ↗
                  </a>
                ) : (
                  <Link
                    className="chat-action"
                    to={resolveRouteHref(message.action.href, page)}
                    onClick={() => setOpen(false)}
                  >
                    {message.action.label} ↗
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <div className="chat-suggestions" aria-label="Suggested questions">
            <button type="button" onClick={() => addSuggestedQuestion(isZh ? "有哪些产品系列？" : "What products do you offer?")}>
              {isZh ? "产品系列" : "Products"}
            </button>
            <button type="button" onClick={() => addSuggestedQuestion(isZh ? "在售价格是多少？" : "What are the listed prices?")}>
              {isZh ? "在售价格" : "Prices"}
            </button>
            <button type="button" onClick={() => addSuggestedQuestion(isZh ? "如何获取报价？" : "How do I get a quote?")}>
              {isZh ? "获取报价" : "Get a quote"}
            </button>
          </div>
          <form className="chat-compose" onSubmit={sendMessage}>
            <label className="sr-only" htmlFor="assistant-message">{isZh ? "向 MHD 助手发送消息" : "Message MHD Assistant"}</label>
            <input
              id="assistant-message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={isZh ? "询问关于产品、价格或报价…" : "Ask about products, prices..."}
              autoComplete="off"
            />
            <button type="submit" aria-label="Send message" disabled={!draft.trim()}>➤</button>
          </form>
          <p className="chat-disclaimer">
            {isZh ? "仅供参考。最终价格与现货情况请与团队确认。" : "Website info only. Confirm prices and availability with our team."}
          </p>
          <a className="chat-powered" href="https://jobgen.ai" target="_blank" rel="noopener noreferrer">
            Powered by jobgen.ai
          </a>
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
            <span><strong>MHD Assistant</strong><small>{isZh ? "随时向我提问" : "Ask me anything"}</small></span>
          </span>
          <i className="chat-launcher-status" aria-label="Assistant available" />
        </button>
      )}
    </div>
  );
}

function SiteApp({ page, product, cartItems, cartOpen, onCartOpen, onCartClose, onAddToCart, onCartQuantityChange, onCartRemove }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const previousPathname = useRef(location.pathname);
  const quoteDialogRef = useRef(null);
  const searchDialogRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [currentLang, setCurrentLang] = useState(getStoredLanguage);
  const [menuOpen, setMenuOpen] = useState(false);
  const handleToggleLanguage = useCallback((target) => {
    const next = typeof target === "string" ? target : (currentLang === "zh" ? "en" : "zh");
    setStoredLanguage(next);
    applyLanguage(next);
    setCurrentLang(next);
  }, [currentLang]);

  useEffect(() => {
    const lang = getStoredLanguage();
    applyLanguage(lang);
    initLanguageObserver();
    const unsub = subscribeLanguage(setCurrentLang);
    return () => unsub();
  }, []);

  useEffect(() => {
    applyLanguage(currentLang);
  }, [currentLang, page, product, location.pathname]);

  const [activeFilter, setActiveFilter] = useState(() => {
    const category = new URLSearchParams(window.location.search).get("category");
    return featuredFilterByShopCategory[category] || "all";
  });
  const [heroVideoIndex, setHeroVideoIndex] = useState(0);
  const [heroVideoPaused, setHeroVideoPaused] = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(2);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const [quoteModel, setQuoteModel] = useState("");
  const [gallery, setGallery] = useState({
    src: "assets/pod-6m-01.webp",
    alt: "6M Micro Pod exterior photo 1"
  });
  const [enquiryNote, setEnquiryNote] = useState("");
  const [searchNote, setSearchNote] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchBackgroundIndex, setSearchBackgroundIndex] = useState(0);
  const [previousSearchBackgroundIndex, setPreviousSearchBackgroundIndex] = useState(null);
  const searchBackgroundIndexRef = useRef(0);
  const nextSearchBackgroundIndexRef = useRef(1);

  useScrollEffects(reducedMotion, pageRef, page);
  useParticles(pageRef, reducedMotion, page);

  useEffect(() => {
    const handlePointerMove = (event) => {
      const expandedWidth = Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--sidebar-expanded-width")
      );
      if (event.clientX > expandedWidth) {
        document.body.classList.remove("sidebar-clicked");
      }
    };
    const handleResize = () => {
      if (!window.matchMedia("(min-width: 901px)").matches) {
        document.body.classList.remove("sidebar-clicked");
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const category = new URLSearchParams(location.search).get("category");
    setActiveFilter(featuredFilterByShopCategory[category] || "all");
  }, [location.search]);

  useEffect(() => {
    if (location.hash) {
      window.requestAnimationFrame(() => {
        document.getElementById(decodeURIComponent(location.hash.slice(1)))
          ?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [location.pathname, location.search, location.hash, reducedMotion]);

  useEffect(() => {
    if (previousPathname.current === location.pathname) return;
    previousPathname.current = location.pathname;
    if (reducedMotion) return;

    const main = document.querySelector("main");
    if (!main) return;

    main.classList.remove("route-page-enter");
    void main.offsetWidth;
    main.classList.add("route-page-enter");
    return () => main.classList.remove("route-page-enter");
  }, [location.pathname, reducedMotion]);

  useEffect(() => {
    const isZh = currentLang === "zh";
    const pageTitles = isZh ? {
      home: "Micro Homes Direct | 澳洲微型房屋、太空舱与双翼拓展集装箱房",
      shop: "选购微型房屋、太空舱与集装箱房 | Micro Homes Direct",
      about: "关于我们 | Micro Homes Direct",
      finance: "金融分期 | Micro Homes Direct",
      contact: "联系我们 | Micro Homes Direct",
      blog: "博客特刊 | Micro Homes Direct",
      blogGuide: "微型房屋全成本规划指南 | Micro Homes Direct",
      blogModularHome: "模块化与预制房屋详解 | Micro Homes Direct",
      blogExpandableHome: "双翼拓展房规划指南 | Micro Homes Direct",
      productDetail: `${product?.name ? translateText(product.name) : "产品详情"} | Micro Homes Direct`
    } : {
      home: "Micro Homes Direct | Tiny Homes, Pods & Container Homes Australia",
      shop: "Shop Tiny Homes, Pods & Containers | Micro Homes Direct",
      about: "About | Micro Homes Direct",
      finance: "Finance | Micro Homes Direct",
      contact: "Contact | Micro Homes Direct",
      blog: "Blog | Micro Homes Direct",
      blogGuide: "Tiny Home Cost Guide | Micro Homes Direct",
      blogModularHome: "Modular and Prefab Homes | Micro Homes Direct",
      blogExpandableHome: "Planning an Expandable Home | Micro Homes Direct",
      productDetail: `${product?.name || "Product"} | Micro Homes Direct`
    };
    document.title = pageTitles[page];
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.content = isZh ? {
        home: "适用于现代生活与工作的创新型微型房屋。探索来自澳大利亚 Micro Homes Direct 的后院太空舱、微型住宅与双翼拓展集装箱房。",
        shop: "按分类浏览 Micro Homes Direct 产品，包含太空舱、高挑顶微型房、拓展集装箱房、卫生间舱与配件实拍图与在售标价。",
        about: "了解 Micro Homes Direct、我们精心设计的紧凑型微居空间、展示网点及多元生活方式。",
        finance: "了解 Micro Homes Direct 购房分期信息与金融方案。",
        contact: "联系 Micro Homes Direct 团队，咨询产品、运送、展厅地址或报价。",
        blog: "阅读关于模块化房屋、后院太空舱与灵活小空间生活的实用灵感与原创指南。",
        blogGuide: "澳大利亚微型房屋整体项目预算规划实用指南，涵盖运输、场地平整通水电及市政审批。",
        blogModularHome: "详解模块化与预制房屋建造方式、专业术语含义，以及如何比对设计、规格与场地要求。",
        blogExpandableHome: "结合您的场地条件、户型格局、运输通行、地基、公用管线与市政规范规划双翼拓展房屋。",
        productDetail: product?.description ? translateText(product.description) : `查看 ${product?.name || "Micro Homes Direct 产品"} 的在售标价、图片及详细信息。`
      }[page] : {
        home: "Innovative Tiny Homes for Modern Life & Work. Explore backyard pods, micro homes, container homes and flexible spaces from Micro Homes Direct, Australia.",
        shop: "Browse Micro Homes Direct products by category, with product photos and listed prices for pods, micro homes, containers, toilets and accessories.",
        about: "Learn about Micro Homes Direct, our thoughtfully designed compact spaces, locations and flexible ways to live.",
        finance: "Explore finance information and options for your Micro Homes Direct purchase.",
        contact: "Contact Micro Homes Direct to ask about products, delivery, locations or a quote.",
        blog: "Read practical ideas and original guides about modular homes, backyard pods and flexible small-space living.",
        blogGuide: "A practical Australian guide to planning the total cost of a tiny home, including delivery, site preparation and approvals.",
        blogModularHome: "Learn how modular and prefab homes are built, what the terms mean, and how to compare designs, specifications and site requirements.",
        blogExpandableHome: "Plan an expandable home around your site, layout, delivery access, foundations, services and local requirements.",
        productDetail: product?.description || `View ${product?.name || "Micro Homes Direct product"}, listed price, images and product information.`
      }[page];
    }
    document.querySelectorAll(".nav-pill a[aria-current]").forEach((link) => {
      link.removeAttribute("aria-current");
    });
    const activeNavigationPage = page.startsWith("blog") ? "blog" : page === "productDetail" ? "shop" : page;
    document.querySelector(`.nav-pill a[data-page="${activeNavigationPage}"]`)?.setAttribute("aria-current", "page");
  }, [page, product, currentLang]);

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
    setSearchOpen(open);
    setSearchNote(message);
    const dialog = searchDialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, []);

  const navigateFromSearch = useCallback((path) => {
    showSearch(false);
    navigate(path);
  }, [navigate, showSearch]);

  useEffect(() => {
    if ((!searchOpen && page !== "about" && page !== "contact") || searchBackgroundImages.length < 2) return undefined;

    const showNextImage = () => {
      const currentIndex = searchBackgroundIndexRef.current;
      const nextIndex = nextSearchBackgroundIndexRef.current;
      const image = new Image();
      image.onload = () => {
        setPreviousSearchBackgroundIndex(currentIndex);
        searchBackgroundIndexRef.current = nextIndex;
        nextSearchBackgroundIndexRef.current = (nextIndex + 1) % searchBackgroundImages.length;
        setSearchBackgroundIndex(nextIndex);
      };
      image.onerror = () => {
        console.warn(`Unable to load search background image: ${searchBackgroundImages[nextIndex]}`);
        nextSearchBackgroundIndexRef.current = (nextIndex + 1) % searchBackgroundImages.length;
      };
      image.src = searchBackgroundImages[nextIndex];
    };

    const timer = window.setInterval(showNextImage, 6500);
    return () => window.clearInterval(timer);
  }, [page, searchOpen]);

  const openQuote = useCallback((preset, open = true) => {
    setMenuOpen(false);
    if (preset) {
      const match = [...document.querySelector("#quote-model").options]
        .find((option) => option.textContent.toLowerCase().includes(preset.toLowerCase()));
      setQuoteModel(match ? match.value : preset);
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
      if (event.target.id === "search-dialog") setSearchOpen(false);
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
        page={page}
        product={product}
        onAddToCart={onAddToCart}
        onCartOpen={onCartOpen}
        cartCount={cartItems.reduce((total, item) => total + item.quantity, 0)}
        onQuoteOpen={openQuote}
        onSearchOpen={showSearch}
        onSearchNavigate={navigateFromSearch}
        searchOpen={searchOpen}
        searchBackgroundIndex={searchBackgroundIndex}
        previousSearchBackgroundIndex={previousSearchBackgroundIndex}
        gallery={gallery}
        onGallerySelect={setGallery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        heroVideoIndex={heroVideoIndex}
        onHeroVideoChange={setHeroVideoIndex}
        heroVideoPaused={heroVideoPaused}
        onHeroVideoTogglePaused={() => setHeroVideoPaused((paused) => !paused)}
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
        currentLang={currentLang}
        onToggleLanguage={handleToggleLanguage}
      />
      {cartOpen && (
        <CartDrawer
          items={cartItems}
          onClose={onCartClose}
          onQuantityChange={onCartQuantityChange}
          onRemove={onCartRemove}
          currentLang={currentLang}
        />
      )}
      <ChatAssistant onQuoteOpen={openQuote} page={page} currentLang={currentLang} />
    </div>
  );
}

function LegacyPageRedirect() {
  const { pathname, search, hash } = useLocation();
  const page = getCurrentPage(pathname);
  return <Navigate to={`${pagePaths[page]}${search}${hash}`} replace />;
}

function ProductsPageRedirect() {
  const { search, hash } = useLocation();
  return <Navigate to={`/shop${search}${hash}`} replace />;
}

export default function App() {
  const [cartItems, setCartItems] = useState(loadCartItems);
  const [cartOpen, setCartOpen] = useState(false);
  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  useEffect(() => {
    try {
      window.localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Unable to save the cart.", error);
    }
  }, [cartItems]);

  const addToCart = useCallback((slug) => {
    if (!shopCatalog.products.some((product) => product.slug === slug)) {
      console.error(`Cannot add unknown product "${slug}" to the cart.`);
      return;
    }
    setCartItems((current) => {
      const existingItem = current.find((item) => item.slug === slug);
      return existingItem
        ? current.map((item) => item.slug === slug ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { slug, quantity: 1 }];
    });
    setCartOpen(true);
  }, []);

  const changeCartQuantity = useCallback((slug, quantity) => {
    setCartItems((current) => quantity < 1
      ? current.filter((item) => item.slug !== slug)
      : current.map((item) => item.slug === slug ? { ...item, quantity } : item));
  }, []);

  const removeFromCart = useCallback((slug) => {
    setCartItems((current) => current.filter((item) => item.slug !== slug));
  }, []);

  return (
    <Routes>
      <Route path="/" element={<SiteApp page="home" cartItems={cartItems} cartOpen={cartOpen} onCartOpen={openCart} onCartClose={closeCart} onAddToCart={addToCart} onCartQuantityChange={changeCartQuantity} onCartRemove={removeFromCart} />} />
      <Route path="/shop" element={<SiteApp page="shop" cartItems={cartItems} cartOpen={cartOpen} onCartOpen={openCart} onCartClose={closeCart} onAddToCart={addToCart} onCartQuantityChange={changeCartQuantity} onCartRemove={removeFromCart} />} />
      <Route path="/product/:slug" element={<ProductDetailRoute onAddToCart={addToCart} cartItems={cartItems} cartOpen={cartOpen} onCartOpen={openCart} onCartClose={closeCart} onCartQuantityChange={changeCartQuantity} onCartRemove={removeFromCart} />} />
      <Route path="/products" element={<ProductsPageRedirect />} />
      <Route path="/about" element={<SiteApp page="about" cartItems={cartItems} cartOpen={cartOpen} onCartOpen={openCart} onCartClose={closeCart} onAddToCart={addToCart} onCartQuantityChange={changeCartQuantity} onCartRemove={removeFromCart} />} />
      <Route path="/finance" element={<SiteApp page="finance" cartItems={cartItems} cartOpen={cartOpen} onCartOpen={openCart} onCartClose={closeCart} onAddToCart={addToCart} onCartQuantityChange={changeCartQuantity} onCartRemove={removeFromCart} />} />
      <Route path="/contact" element={<SiteApp page="contact" cartItems={cartItems} cartOpen={cartOpen} onCartOpen={openCart} onCartClose={closeCart} onAddToCart={addToCart} onCartQuantityChange={changeCartQuantity} onCartRemove={removeFromCart} />} />
      <Route path="/blog" element={<SiteApp page="blog" cartItems={cartItems} cartOpen={cartOpen} onCartOpen={openCart} onCartClose={closeCart} onAddToCart={addToCart} onCartQuantityChange={changeCartQuantity} onCartRemove={removeFromCart} />} />
      <Route path="/blog/cost-guide" element={<SiteApp page="blogGuide" cartItems={cartItems} cartOpen={cartOpen} onCartOpen={openCart} onCartClose={closeCart} onAddToCart={addToCart} onCartQuantityChange={changeCartQuantity} onCartRemove={removeFromCart} />} />
      <Route path="/blog/what-is-a-modular-home" element={<SiteApp page="blogModularHome" cartItems={cartItems} cartOpen={cartOpen} onCartOpen={openCart} onCartClose={closeCart} onAddToCart={addToCart} onCartQuantityChange={changeCartQuantity} onCartRemove={removeFromCart} />} />
      <Route path="/blog/expandable-homes" element={<SiteApp page="blogExpandableHome" cartItems={cartItems} cartOpen={cartOpen} onCartOpen={openCart} onCartClose={closeCart} onAddToCart={addToCart} onCartQuantityChange={changeCartQuantity} onCartRemove={removeFromCart} />} />
      <Route path="/index.html" element={<Navigate to="/" replace />} />
      <Route path="/shop.html" element={<LegacyPageRedirect />} />
      <Route path="/products.html" element={<ProductsPageRedirect />} />
      <Route path="/about.html" element={<LegacyPageRedirect />} />
      <Route path="/finance.html" element={<LegacyPageRedirect />} />
      <Route path="/contact.html" element={<LegacyPageRedirect />} />
      <Route path="/blog.html" element={<LegacyPageRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
