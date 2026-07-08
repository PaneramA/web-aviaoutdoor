import { motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

type BrandLogo = {
  alt: string;
  src: string;
};

type BrandLogoMarqueeProps = {
  logos: BrandLogo[];
};

export default function BrandLogoMarquee({ logos }: BrandLogoMarqueeProps) {
  const groupRef = useRef<HTMLDivElement | null>(null);
  const [groupWidth, setGroupWidth] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const duration = prefersReducedMotion ? 72 : 36;

  useEffect(() => {
    setHasMounted(true);

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!groupRef.current) {
      return;
    }

    const element = groupRef.current;
    const updateWidth = () => setGroupWidth(element.offsetWidth);

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(element);
    window.addEventListener("resize", updateWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  const renderLogo = (logo: BrandLogo, key: string) => (
    <div
      key={key}
      className="flex h-12 shrink-0 items-center justify-center sm:h-14 lg:h-16"
    >
      <img
        src={logo.src}
        alt={logo.alt}
        loading="lazy"
        decoding="async"
        className="h-6 w-auto max-w-none object-contain opacity-[0.85] transition-opacity duration-200 ease-out hover:opacity-100 sm:h-7 lg:h-9"
      />
    </div>
  );

  return (
    <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,rgba(0,0,0,0.96)_8%,rgba(0,0,0,0.96)_92%,transparent)] [-webkit-mask-image:linear-gradient(90deg,transparent,rgba(0,0,0,0.96)_8%,rgba(0,0,0,0.96)_92%,transparent)]">
      <motion.div
        className="flex w-max flex-nowrap items-center will-change-transform"
        initial={{ x: 0 }}
        animate={
          hasMounted && groupWidth > 0
            ? { x: [0, -groupWidth] }
            : { x: 0 }
        }
        transition={
          hasMounted && groupWidth > 0
            ? {
                duration,
                ease: "linear",
                repeat: Infinity,
              }
            : undefined
        }
      >
        {([0, 1] as const).map((groupIndex) => (
          <div
            key={groupIndex}
            ref={groupIndex === 0 ? groupRef : undefined}
            className="flex shrink-0 flex-nowrap items-center gap-8 pr-8 sm:gap-10 sm:pr-10 lg:gap-12 lg:pr-12"
            aria-hidden={groupIndex === 1}
          >
            {logos.map((logo, logoIndex) =>
              renderLogo(logo, `group-${groupIndex}-${logo.alt}-${logoIndex}`),
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
