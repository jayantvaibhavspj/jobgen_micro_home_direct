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

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
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

function ProductDetail({ product, onAddToCart }) {
  const [activeImage, setActiveImage] = useState(0);
  const category = shopCatalog.categories.find(({ slug }) => slug === product.category);
  const gallery = product.gallery?.length
    ? product.gallery
    : [product.image || category?.image].filter(Boolean);
  const relatedProducts = shopCatalog.products
    .filter((item) => item.category === product.category && item.slug !== product.slug)
    .slice(0, 4);

  return (
    <div className="product-detail-page">
      <nav className="product-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link><span aria-hidden="true">/</span>
        <Link to="/shop">Shop</Link><span aria-hidden="true">/</span>
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{category?.label || "Products"}</Link>
        <span aria-hidden="true">/</span><span aria-current="page">{product.name}</span>
      </nav>

      <section className="product-detail-hero">
        <div className="product-detail-gallery">
          <div className="product-detail-main-image">
            {gallery[activeImage] && <img src={gallery[activeImage]} alt={product.name} fetchPriority="high" />}
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
          <p className="eyebrow"><Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{category?.label || "Micro Homes Direct"}</Link></p>
          <h1>{product.name}</h1>
          <p className="product-detail-price">{product.price}<span>AUD · Listed price</span></p>
          <p className="product-detail-description">{product.description || "Contact our team for product specifications, current availability and delivery information."}</p>
          <div className="product-detail-actions">
            <button className="cart-add-button cart-add-button--detail" type="button" onClick={() => onAddToCart(product.slug)}>
              Add to cart
            </button>
            <button className="button quote-open" type="button" data-interest={product.name}>
              Enquire about this product <span className="button-icon">↗</span>
            </button>
            <a className="product-detail-phone" href="tel:1300229166">Call 1300 229 166</a>
          </div>
          <p className="product-detail-disclaimer">Prices and availability may change. Confirm final details with our team before ordering.</p>
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

function ShopCatalog({ onAddToCart }) {
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
          <p className="eyebrow">FIND YOUR FIT</p>
          <h2>Space that fits <em>your next chapter.</em></h2>
          <p>From focused workspaces to flexible living and storage, explore the range and ask us about the details that matter to your plans.</p>
        </div>
        <p className="eyebrow">SHOP BY CATEGORY</p>
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
                <span>{category.label}</span>
                <small>{category.count} products</small>
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
          View all {shopCatalog.products.length} products <span aria-hidden="true">↗</span>
        </button>
      </div>

      <div className="shop-products" id="shop-products">
        <div className="shop-products-heading">
          <div>
            <p className="eyebrow">{activeCategoryInfo ? activeCategoryInfo.label : "THE FULL COLLECTION"}</p>
            <h2>{activeCategoryInfo ? activeCategoryInfo.label : "All products"}</h2>
          </div>
          <p className="shop-results-count" aria-live="polite">
            {visibleProducts.length} {visibleProducts.length === 1 ? "product" : "products"}
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
                  Add to cart
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

function CartDrawer({ items, onClose, onQuantityChange, onRemove }) {
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
            <p className="eyebrow">YOUR SELECTION</p>
            <h2 id="cart-title">Shopping cart <span>({itemCount})</span></h2>
          </div>
          <button className="cart-close" type="button" aria-label="Close cart" onClick={onClose}>×</button>
        </div>
        {cartProducts.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <button className="cart-continue-button" type="button" onClick={onClose}>Continue shopping</button>
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
                      <button className="cart-remove" type="button" onClick={() => onRemove(product.slug)}>Remove</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="cart-drawer-footer">
              <div className="cart-subtotal"><span>Listed subtotal</span><strong>${subtotal.toLocaleString("en-AU", { maximumFractionDigits: 2 })} AUD</strong></div>
              <p>Delivery and final pricing are confirmed with our team before ordering.</p>
              <Link className="button cart-contact-button" to="/contact" onClick={onClose}>Contact us about your cart <span className="button-icon">↗</span></Link>
              <button className="cart-continue-button" type="button" onClick={onClose}>Continue shopping</button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function SiteMarkup({
  page,
  product,
  onAddToCart,
  onCartOpen,
  cartCount,
  menuOpen,
  onMenuToggle,
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
  searchNote
}) {
  const options = useMemo(() => ({
    replace(node) {
      if (!node.attribs) return undefined;

      const props = attributesToProps(node.attribs);
      if (node.name === "div" && node.attribs.id === "route-page-content") {
        return <>{parse(pageMarkups[page], options)}</>;
      }
      if (node.name === "div" && node.attribs.id === "search-background") {
        return <SearchBackdrop index={searchBackgroundIndex} previousIndex={previousSearchBackgroundIndex} />;
      }
      if (node.name === "div" && node.attribs.id === "faq-background") {
        return <SearchBackdrop index={searchBackgroundIndex} previousIndex={previousSearchBackgroundIndex} className="search-backdrop faq-backdrop" />;
      }
      if (node.name === "div" && node.attribs.id === "shop-product-catalog") {
        return <ShopCatalog onAddToCart={onAddToCart} />;
      }
      if (node.name === "div" && node.attribs.id === "finance-calculator-embed") {
        return <FinanceCalculatorFrame />;
      }
      if (node.name === "div" && node.attribs.id === "product-detail-mount") {
        return <ProductDetail product={product} onAddToCart={onAddToCart} />;
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

      if (node.name === "nav" && classes.split(/\s+/).includes("nav-pill")) {
        return (
          <>
            {menuOpen && (
              <button
                className="sidebar-backdrop"
                type="button"
                aria-label="Close navigation"
                onClick={() => onMenuToggle(false)}
              />
            )}
            <nav
              {...props}
              className={`nav-pill${menuOpen ? " open" : ""}`}
              aria-hidden={!menuOpen && window.matchMedia("(max-width: 900px)").matches}
              onClick={(event) => {
                const clickedControl = event.target.closest(
                  "a, .sidebar-close, .nav-search, .sidebar-quote-link"
                );
                if (clickedControl) {
                  clickedControl.blur();
                  if (window.matchMedia("(min-width: 901px)").matches) {
                    document.body.classList.add("sidebar-clicked");
                  }
                  onMenuToggle(false);
                }
              }}
            >
              {children}
            </nav>
          </>
        );
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
        return <h2 {...props}>{featuredModels[featuredIndex].name}</h2>;
      }

      if (node.name === "p" && node.attribs.id === "hero-eyebrow") {
        return <p {...props}>FLEXIBLE SPACES · MADE FOR REAL LIFE</p>;
      }

      if (node.name === "a" && node.attribs.id === "hero-explore-link") {
        const { href, ...linkProps } = props;
        return <Link {...linkProps} to={href}>Explore our range<span className="button-icon">↗</span></Link>;
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
      if (node.name === "button" && classes.split(/\s+/).includes("sidebar-close")) {
        return (
          <button {...props} onClick={() => onMenuToggle(false)}>
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
    menuOpen, onMenuToggle, gallery, onGallerySelect, activeFilter, onFilterChange,
    heroVideoIndex, onHeroVideoChange, heroVideoPaused, onHeroVideoTogglePaused,
    featuredIndex, onFeaturedChange, autoplayPaused, onAutoplayToggle, reducedMotion,
    quoteDialogRef, searchDialogRef,
    quoteModel, onQuoteModelChange, enquiryNote, searchNote, onQuoteOpen, onSearchOpen, onSearchNavigate,
    searchOpen, searchBackgroundIndex, previousSearchBackgroundIndex
  ]);

  return parse(siteShellMarkup, options);
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
      action: { label: "View product range", href: "/shop#models" }
    };
  }
  if (has("price", "cost", "kitna", "कीमत", "दाम", "rate")) {
    const prices = assistantProducts.filter((item) => item.price)
      .map((item) => `${item.name}: ${item.price}${item.oldPrice ? ` (was ${item.oldPrice})` : ""}.`)
      .join(" ");
    return { text: hindi
      ? `Website पर listed prices: ${prices} ये indicative prices हैं—latest जानकारी team से confirm करें।`
      : `The website lists these prices: ${prices} They’re indicative and should be confirmed with the team.`,
    action: { label: "Browse products", href: "/shop#models" } };
  }
  if (has("compare", "comparison", "difference", "versus", " vs ", "better", "best", "kaunsa", "कौन सा")) {
    return { text: "The best choice depends on how you’ll use the space, the size you need and your site. The catalogue shows product descriptions and listed prices; tell me which two models you’re comparing and I can share the listed details. For exact specifications, ask our team.", action: { label: "Compare in catalogue", href: "/shop#models" } };
  }
  if (has("finance", "loan", "emi", "installment", "instalment", "फाइनेंस", "किस्त")) {
    return { text: "Finance options may be available, subject to the provider’s terms, eligibility, assessment and approval. Visit our finance page for indicative information; the finance provider can confirm your options.", action: { label: "Finance information", href: "/finance" } };
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

function ChatAssistant({ onQuoteOpen, page }) {
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
            <span><strong>MHD Assistant</strong><small>Ask me anything</small></span>
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuWasOpen = useRef(false);
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
    const pageTitles = {
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
      description.content = {
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
  }, [page, product]);

  useEffect(() => {
    if (menuOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.querySelector(".sidebar-close")?.focus();
      const handleKeyDown = (event) => {
        if (event.key === "Escape") setMenuOpen(false);
      };
      document.addEventListener("keydown", handleKeyDown);
      menuWasOpen.current = true;
      return () => {
        document.body.style.overflow = previousOverflow;
        document.removeEventListener("keydown", handleKeyDown);
      };
    }

    if (menuWasOpen.current) {
      document.querySelector(".menu-toggle")?.focus();
      menuWasOpen.current = false;
    }
    return undefined;
  }, [menuOpen]);

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
        menuOpen={menuOpen}
        onMenuToggle={setMenuOpen}
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
      />
      {cartOpen && (
        <CartDrawer
          items={cartItems}
          onClose={onCartClose}
          onQuantityChange={onCartQuantityChange}
          onRemove={onCartRemove}
        />
      )}
      <ChatAssistant onQuoteOpen={openQuote} page={page} />
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
