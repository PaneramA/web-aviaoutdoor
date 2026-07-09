import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function setupScrollFrameGallery() {
  const root = document.querySelector<HTMLElement>("[data-scroll-frame-gallery]");
  const viewport = root?.querySelector<HTMLElement>(".scroll-frame-gallery__viewport");

  if (!root || !viewport || root.dataset.scrollFrameGalleryInitialized === "true") {
    return;
  }

  root.dataset.scrollFrameGalleryInitialized = "true";

  const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-scroll-frame-row]"));
  const images = Array.from(root.querySelectorAll<HTMLImageElement>(".scroll-frame-gallery__image"));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const compactViewport = window.matchMedia("(max-width: 767px)");
  let context: gsap.Context | null = null;
  let rebuildTimeout: number | undefined;
  let renderTicker: (() => void) | null = null;

  if (rows.length === 0) {
    root.dataset.motion = "reduced";
    return;
  }

  const getTravel = (row: HTMLElement) => {
    const rowWidth = Math.max(row.scrollWidth, row.getBoundingClientRect().width);
    return Math.max(rowWidth - viewport.clientWidth, 0);
  };

  const preloadImages = () => {
    images.forEach((image) => {
      const preloader = new Image();
      preloader.decoding = "async";
      preloader.src = image.currentSrc || image.src;
    });
  };

  const removeRenderTicker = () => {
    if (!renderTicker) {
      return;
    }

    gsap.ticker.remove(renderTicker);
    renderTicker = null;
  };

  const enableStaticMode = () => {
    removeRenderTicker();
    context?.revert();
    ScrollTrigger.getById("avia-scroll-frame-gallery")?.kill();
    rows.forEach((row) => {
      gsap.set(row, { clearProps: "transform" });
    });
    root.dataset.motion = "reduced";
  };

  const build = () => {
    removeRenderTicker();
    context?.revert();
    ScrollTrigger.getById("avia-scroll-frame-gallery")?.kill();

    if (compactViewport.matches) {
      enableStaticMode();
      ScrollTrigger.refresh();
      return;
    }

    root.dataset.motion = "animated";

    context = gsap.context(() => {
      let targetProgress = 0;
      let renderedProgress = 0;

      const setRowsByProgress = (progress: number) => {
        rows.forEach((row) => {
          const travel = getTravel(row);
          const direction = row.dataset.scrollFrameRow;
          const x = direction === "forward" ? -travel + travel * progress : -travel * progress;

          gsap.set(row, { x, force3D: true });
        });
      };

      renderTicker = () => {
        const distance = targetProgress - renderedProgress;

        if (Math.abs(distance) < 0.0006) {
          if (renderedProgress !== targetProgress) {
            renderedProgress = targetProgress;
            setRowsByProgress(renderedProgress);
          }

          return;
        }

        renderedProgress += distance * 0.115;
        setRowsByProgress(renderedProgress);
      };

      setRowsByProgress(0);
      gsap.ticker.add(renderTicker);

      ScrollTrigger.create({
        id: "avia-scroll-frame-gallery",
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        scrub: prefersReducedMotion.matches ? 1.2 : 0.75,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          targetProgress = self.progress;
          renderedProgress = self.progress;
          setRowsByProgress(renderedProgress);
        },
        onUpdate: (self) => {
          targetProgress = self.progress;
        },
      });
    }, root);

    ScrollTrigger.refresh();
  };

  const scheduleBuild = () => {
    window.clearTimeout(rebuildTimeout);
    rebuildTimeout = window.setTimeout(build, 80);
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          preloadImages();
          observer.disconnect();
        }
      },
      { rootMargin: "1200px 0px" },
    );

    observer.observe(root);
  } else {
    window.setTimeout(preloadImages, 1200);
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(build);
  });

  window.addEventListener("load", scheduleBuild, { once: true });

  window.addEventListener("resize", scheduleBuild, { passive: true });
  prefersReducedMotion.addEventListener("change", scheduleBuild);
  compactViewport.addEventListener("change", scheduleBuild);
}
