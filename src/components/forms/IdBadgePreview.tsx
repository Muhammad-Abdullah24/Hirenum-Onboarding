"use client";

import { useEffect, useRef, useState } from "react";
import { Check, User } from "lucide-react";

export type BadgeSection = {
  label: string;
  complete: boolean;
};

export function IdBadgePreview({
  fullName,
  photoFile,
  nationality,
  sections,
  allComplete,
}: {
  fullName: string;
  photoFile: File | null;
  nationality: string;
  sections: BadgeSection[];
  allComplete: boolean;
}) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!photoFile) {
      setPhotoUrl(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  const completedCount = sections.filter((s) => s.complete).length;
  const progressPercent = Math.round((completedCount / sections.length) * 100);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reducedMotionRef.current) return;
    const el = badgeRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--tilt-x", `${(0.5 - py) * 8}deg`);
    el.style.setProperty("--tilt-y", `${(px - 0.5) * 8}deg`);
    el.style.setProperty("--glare-x", `${px * 100}%`);
    el.style.setProperty("--glare-y", `${py * 100}%`);
    el.style.setProperty("--glare-opacity", "1");
  }

  function handleMouseLeave() {
    const el = badgeRef.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
    el.style.setProperty("--glare-opacity", "0");
  }

  return (
    <div className="id-badge-tilt-wrap">
      <div
        ref={badgeRef}
        className={`id-badge ${allComplete ? "is-sealed" : ""}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <span className="id-badge-glare" aria-hidden="true" />
        <div className="id-badge-topbar" />
        <div className="id-badge-body">
          <div
            className="id-badge-photo-ring"
            style={{ "--badge-progress": progressPercent } as React.CSSProperties}
          >
            <div className="id-badge-photo">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" />
              ) : (
                <User size={28} className="id-badge-photo-placeholder" />
              )}
            </div>
          </div>

          <p className="id-badge-name">{fullName || "Your name here"}</p>
          <p className="id-badge-sub">
            {nationality || "Hirenum team member"}
          </p>
          <p className="id-badge-progress-note">{progressPercent}% ready</p>

          <div className="id-badge-divider" />

          <ul className="id-badge-checklist">
            {sections.map((s) => (
              <li key={s.label} className={s.complete ? "is-complete" : ""}>
                <span className="id-badge-checklist-icon">
                  {s.complete && <Check size={11} />}
                </span>
                {s.label}
              </li>
            ))}
          </ul>
        </div>

        {allComplete && (
          <div className="id-badge-seal">
            <span className="id-badge-confetti" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="confetti-piece" />
              ))}
            </span>
            <span>Welcome aboard</span>
          </div>
        )}
      </div>
    </div>
  );
}
