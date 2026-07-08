import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function setupScrollFrameGallery() {
  const root = document.querySelector<HTMLElement>("[data-scroll-frame-gallery]");

  if (!root || root.dataset.scrollFrameGalleryInitialized === "true") {
    return;
  }

  root.dataset.scrollFrameGalleryInitialized = "true";

  const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-scroll-frame-row]"));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let context: gsap.Context | null = null;
  let rebuildTimeout: number | undefined;

  if (rows.length === 0) {
    root.dataset.motion = "reduced";
    return;
  }

  const getTravel = (row: HTMLElement) => {
    const viewport = row.parentElement?.clientWidth ?? window.innerWidth;
    return Math.max(row.scrollWidth - viewport, 0);
  };

  const build = () => {
    context?.revert();
    ScrollTrigger.getById("avia-scroll-frame-gallery")?.kill();

    root.dataset.motion = prefersReducedMotion.matches ? "reduced" : "animated";

    context = gsap.context(() => {
      rows.forEach((row) => {
        const direction = row.dataset.scrollFrameRow;

        gsap.set(row, {
          x: direction === "forward" ? -getTravel(row) : 0,
        });
      });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          id: "avia-scroll-frame-gallery",
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: prefersReducedMotion.matches ? 1.2 : 0.75,
          invalidateOnRefresh: true,
        },
      });

      rows.forEach((row) => {
        const direction = row.dataset.scrollFrameRow;

        timeline.to(
          row,
          {
            x: () => (direction === "forward" ? 0 : -getTravel(row)),
            force3D: true,
          },
          0,
        );
      });
    }, root);

    ScrollTrigger.refresh();
  };

  const scheduleBuild = () => {
    window.clearTimeout(rebuildTimeout);
    rebuildTimeout = window.setTimeout(build, 80);
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(build);
  });

  window.addEventListener("load", scheduleBuild, { once: true });

  window.addEventListener("resize", scheduleBuild, { passive: true });
  prefersReducedMotion.addEventListener("change", scheduleBuild);
}
