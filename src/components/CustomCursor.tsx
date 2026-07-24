"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR = "a, button, [role='button'], summary, [data-cursor-hover]";
const TEXT_SELECTOR = "input, textarea, select, [contenteditable='true']";

/**
 * Custom cursor for the landing page: a small solid dot that tracks the pointer
 * exactly, plus a ring that trails behind it with easing. The ring grows and
 * fills with brand red over links/buttons, and hides entirely over text fields
 * so native text-input affordances (I-beam, focus) still work normally.
 *
 * Desktop-only (pointer: fine) and skipped for prefers-reduced-motion — mirrors
 * the guard used by AnimatedCounter/HeroLogoMark3D elsewhere in this codebase.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isFinePointer || reducedMotion) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.classList.add("hub-cursor-active");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let raf = 0;
    let revealed = false;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      if (!revealed) {
        revealed = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
    };

    const loop = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(TEXT_SELECTOR)) {
        ring.classList.add("hub-cursor-ring--text");
        dot.classList.add("hub-cursor-dot--text");
      } else if (target.closest(INTERACTIVE_SELECTOR)) {
        ring.classList.add("hub-cursor-ring--hover");
      }
    };

    const onOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(TEXT_SELECTOR)) {
        ring.classList.remove("hub-cursor-ring--text");
        dot.classList.remove("hub-cursor-dot--text");
      } else if (target.closest(INTERACTIVE_SELECTOR)) {
        ring.classList.remove("hub-cursor-ring--hover");
      }
    };

    const onDown = () => ring.classList.add("hub-cursor-ring--active");
    const onUp = () => ring.classList.remove("hub-cursor-ring--active");

    const onLeaveWindow = () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };
    const onEnterWindow = () => {
      if (revealed) {
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeaveWindow);
    document.documentElement.addEventListener("mouseenter", onEnterWindow);
    raf = requestAnimationFrame(loop);

    return () => {
      document.documentElement.classList.remove("hub-cursor-active");
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeaveWindow);
      document.documentElement.removeEventListener("mouseenter", onEnterWindow);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="hub-cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="hub-cursor-dot" aria-hidden="true" />
    </>
  );
}
