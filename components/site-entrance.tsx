"use client";

import { useEffect, useState, type ReactNode, type SyntheticEvent } from "react";

export function SiteEntrance({ children }: { children: ReactNode }) {
  const [entering, setEntering] = useState(true);

  useEffect(() => {
    if (!entering) return;
    // Release the entrance styles so later insertions and drags never replay them.
    const timer = setTimeout(() => setEntering(false), 1600);
    return () => clearTimeout(timer);
  }, [entering]);

  const finishEntrance = (event: SyntheticEvent<HTMLDivElement>) => {
    if (!entering) return;
    // Finish before a drag sensor measures the source card's position.
    event.currentTarget.classList.remove("site-entering");
    setEntering(false);
  };

  return (
    <div
      className={`site-entrance${entering ? " site-entering" : ""}`}
      onPointerDownCapture={finishEntrance}
      onFocusCapture={finishEntrance}
    >
      {children}
    </div>
  );
}
