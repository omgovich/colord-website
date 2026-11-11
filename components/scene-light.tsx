"use client";

import { useEffect } from "react";

const surfaces = ".glass, .code-panel, .shell-proof-panel, .shell-facts-ribbon";

/** One diffuse spotlight, projected into every surface's local coordinates. */
export default function SceneLight() {
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let dirty = true;
    let settleUntil = 0;
    let lastTime = performance.now();
    let elements: HTMLElement[] = [];
    let pointer = { x: 0.5, y: 0.4 };
    let current = { x: innerWidth * 0.5, y: innerHeight * 0.4 };

    const paint = (now: number) => {
      frame = 0;
      if (reduced.matches) return;
      if (dirty) {
        elements = Array.from(document.querySelectorAll<HTMLElement>(surfaces));
        dirty = false;
      }
      const target = {
        x: innerWidth * (0.12 + pointer.x * 0.76),
        y: innerHeight * (0.15 + pointer.y * 0.7),
      };
      const response = 1 - Math.exp(-Math.min(50, now - lastTime) / 160);
      lastTime = now;
      current.x += (target.x - current.x) * response;
      current.y += (target.y - current.y) * response;

      // Batch reads before writes; the reflection never changes layout.
      const projected = elements.flatMap((element) => {
        const rect = element.getBoundingClientRect();
        if (
          !rect.width ||
          !rect.height ||
          rect.bottom < -100 ||
          rect.top > innerHeight + 100
        )
          return [];
        return [{ element, x: current.x - rect.left, y: current.y - rect.top }];
      });
      for (const { element, x, y } of projected) {
        element.style.setProperty("--reflection-x", `${x.toFixed(2)}px`);
        element.style.setProperty("--reflection-y", `${y.toFixed(2)}px`);
      }
      if (
        now < settleUntil ||
        Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > 0.3
      ) {
        frame = requestAnimationFrame(paint);
      }
    };
    const schedule = () => {
      if (!frame && !reduced.matches) {
        lastTime = performance.now();
        frame = requestAnimationFrame(paint);
      }
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer = {
        x: event.clientX / innerWidth,
        y: event.clientY / innerHeight,
      };
      schedule();
    };
    const reset = () => {
      pointer = { x: 0.5, y: 0.4 };
      schedule();
    };
    const refresh = () => {
      dirty = true;
      settleUntil = Math.max(settleUntil, performance.now() + 450);
      schedule();
    };
    const scroll = () => {
      settleUntil = Math.max(settleUntil, performance.now() + 140);
      schedule();
    };
    const preference = () => {
      if (reduced.matches) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else refresh();
    };
    const animation = () => {
      settleUntil = Math.max(settleUntil, performance.now() + 900);
      schedule();
    };
    document.addEventListener("animationstart", animation);
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    document.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    window.addEventListener("scroll", scroll, { passive: true, capture: true });
    document.addEventListener("focusin", refresh);
    window.addEventListener("resize", refresh, { passive: true });
    reduced.addEventListener("change", preference);
    refresh();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("animationstart", animation);
      document.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", reset);
      window.removeEventListener("scroll", scroll, true);
      document.removeEventListener("focusin", refresh);
      window.removeEventListener("resize", refresh);
      reduced.removeEventListener("change", preference);
    };
  }, []);
  return null;
}
