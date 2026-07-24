"use client";

import { useEffect, useRef } from "react";
import { Spark } from "./Logo";

const MAX_TILT = 14; // degrees, either axis
const EASE = 0.06; // pointer-follow smoothing — lower = lazier, more "premium" feel

/**
 * Big floating spark mark for the hero background. Fakes 3D via three stacked
 * SVG layers (dark → mid → gradient) offset on the Z axis, plus a soft idle
 * float and a subtle tilt that follows the cursor anywhere on the page.
 * Decorative only — hidden from screen readers, no pointer events, and it
 * goes fully static under prefers-reduced-motion.
 */
export function HeroLogoMark3D() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onPointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      target.current = { x: Math.max(-1, Math.min(1, nx)), y: Math.max(-1, Math.min(1, ny)) };
    };

    const animate = () => {
      current.current.x += (target.current.x - current.current.x) * EASE;
      current.current.y += (target.current.y - current.current.y) * EASE;
      const el = tiltRef.current;
      if (el) {
        const rx = (-current.current.y * MAX_TILT).toFixed(2);
        const ry = (current.current.x * MAX_TILT).toFixed(2);
        el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="hub-float pointer-events-none absolute right-[4%] top-[10%] hidden h-[clamp(150px,15vw,220px)] w-[clamp(150px,15vw,220px)] lg:block"
      style={{ perspective: "700px" }}
    >
      <div
        ref={tiltRef}
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d", transition: "transform 0.1s linear" }}
      >
        <div
          className="absolute inset-0 scale-[.94] opacity-30"
          style={{ transform: "translateZ(-26px)" }}
        >
          <Spark gradId="hero3d-back" fill="#5a1810" />
        </div>
        <div
          className="absolute inset-0 scale-[.97] opacity-55"
          style={{ transform: "translateZ(-13px)" }}
        >
          <Spark gradId="hero3d-mid" fill="#8a2418" />
        </div>
        <div
          className="absolute inset-0"
          style={{
            transform: "translateZ(0)",
            filter:
              "drop-shadow(0 22px 30px rgba(0,0,0,.5)) drop-shadow(0 0 26px rgba(232,67,46,.35))",
          }}
        >
          <Spark gradId="hero3d-front" />
        </div>
      </div>
    </div>
  );
}
