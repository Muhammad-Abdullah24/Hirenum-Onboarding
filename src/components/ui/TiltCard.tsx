"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

const MAX_TILT = 10;

export function TiltCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reducedMotionRef.current) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * MAX_TILT * 2;
    const rotateX = (0.5 - py) * MAX_TILT * 2;
    card.style.setProperty("--tilt-x", `${rotateX}deg`);
    card.style.setProperty("--tilt-y", `${rotateY}deg`);
    card.style.setProperty("--glare-x", `${px * 100}%`);
    card.style.setProperty("--glare-y", `${py * 100}%`);
    card.style.setProperty("--glare-opacity", "1");
  }

  function handleMouseLeave() {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
    card.style.setProperty("--glare-opacity", "0");
  }

  return (
    <div className="tilt-card-wrap">
      <div
        ref={cardRef}
        className="tilt-card"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <span className="tilt-card-glare" aria-hidden="true" />
        <div className="tilt-card-content">
          <Image
            src="/hirenum-logo.png"
            alt="Hirenum"
            width={196}
            height={40}
            style={{ height: "34px", width: "auto" }}
          />
          <div className="tilt-card-divider" />
          <p className="tilt-card-line">
            Small team. Real ownership. Work that actually ships.
          </p>
        </div>
      </div>
    </div>
  );
}
