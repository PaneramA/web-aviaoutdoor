import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function setupHeroIntro() {
  const hero = document.querySelector<HTMLElement>("[data-hero-root]");
  const content = document.querySelector<HTMLElement>("[data-hero-content]");
  const nextPanel = document.querySelector<HTMLElement>("[data-next-panel]");

  if (!hero || !content || !nextPanel || hero.dataset.heroIntroInitialized === "true") {
    return;
  }

  hero.dataset.heroIntroInitialized = "true";

  ScrollTrigger.getById("avia-hero-intro")?.kill();

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (prefersReducedMotion.matches) {
    hero.dataset.motion = "reduced";
    return;
  }

  hero.dataset.motion = "animated";

  const context = gsap.context(() => {
    gsap.set(content, { y: 0, opacity: 1 });
    gsap.set(nextPanel, { yPercent: 100 });

    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        id: "avia-hero-intro",
        trigger: hero,
        start: "top top",
        end: "+=100%",
        scrub: 0.8,
        pin: true,
        anticipatePin: 1,
      },
    });

    timeline
      .to(content, { y: -120, opacity: 0, duration: 1 }, 0)
      .to(nextPanel, { yPercent: 0, duration: 1 }, 0);
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
