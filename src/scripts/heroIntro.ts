import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function setupHeroIntro() {
  const hero = document.querySelector<HTMLElement>("[data-hero-root]");
  const content = document.querySelector<HTMLElement>("[data-hero-content]");
  const image = document.querySelector<HTMLElement>("[data-hero-image]");

  if (!hero || !content || hero.dataset.heroIntroInitialized === "true") {
    return;
  }

  hero.dataset.heroIntroInitialized = "true";

  ScrollTrigger.getById("avia-hero-intro")?.kill();

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canUseHeroMotion = window.matchMedia("(min-width: 1024px)");

  if (prefersReducedMotion.matches || !canUseHeroMotion.matches) {
    hero.dataset.motion = "reduced";
    return;
  }

  hero.dataset.motion = "animated";

  const context = gsap.context(() => {
    gsap.set(content, { y: 0, opacity: 1 });

    if (image) {
      gsap.set(image, { scale: 1.02, y: 0 });
    }

    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        id: "avia-hero-intro",
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });

    timeline.to(content, { y: -72, opacity: 0.28, duration: 1 }, 0);

    if (image) {
      timeline.to(image, { y: 44, scale: 1.08, duration: 1 }, 0);
    }
  });

  const handleReducedMotionChange = (event: MediaQueryListEvent) => {
    if (!event.matches) {
      return;
    }

    context.revert();
    ScrollTrigger.getById("avia-hero-intro")?.kill();
    hero.dataset.motion = "reduced";
  };

  prefersReducedMotion.addEventListener("change", handleReducedMotionChange, { once: true });
}
