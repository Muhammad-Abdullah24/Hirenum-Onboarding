"use client";

import {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

const DRAG_MAX = 46;
const TOGGLE_THRESHOLD = 18;

export function LampReveal({ children }: { children: React.ReactNode }) {
  const [lit, setLit] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [sparkKey, setSparkKey] = useState(0);
  const startYRef = useRef(0);
  const dragYRef = useRef(0);
  const didToggleViaDragRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) setLit(true);
  }, []);

  useEffect(() => {
    if (lit) setSparkKey((k) => k + 1);
  }, [lit]);

  // Track the drag with window-level listeners rather than relying on
  // setPointerCapture, so a fast pull that leaves the small bead's hit
  // area still tracks correctly instead of dropping the gesture.
  useEffect(() => {
    if (!dragging) return;

    function handleMove(e: PointerEvent) {
      const delta = Math.max(0, Math.min(DRAG_MAX, e.clientY - startYRef.current));
      dragYRef.current = delta;
      setDragY(delta);
    }

    function handleUp() {
      setDragging(false);
      if (dragYRef.current >= TOGGLE_THRESHOLD) {
        setLit((prev) => !prev);
        didToggleViaDragRef.current = true;
      }
      dragYRef.current = 0;
      setDragY(0);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [dragging]);

  function handlePointerDown(e: ReactPointerEvent<HTMLButtonElement>) {
    startYRef.current = e.clientY;
    setDragging(true);
  }

  function handleClick(e: ReactMouseEvent<HTMLButtonElement>) {
    if (didToggleViaDragRef.current) {
      didToggleViaDragRef.current = false;
      return;
    }
    // Real pointer clicks shouldn't toggle the lamp — only an actual pull
    // (handled in handleUp above) should. Keyboard activation (Enter/Space)
    // fires a click with detail 0, so it still works for accessibility.
    if (e.detail !== 0) return;
    setLit((prev) => !prev);
  }

  function handleFocusCapture(e: React.FocusEvent<HTMLDivElement>) {
    // Ignore focus landing on the cord bead itself — its own click/drag
    // handlers own the toggle. Only auto-reveal when focus moves past it
    // into the form (e.g. a keyboard user tabbing straight through).
    if ((e.target as HTMLElement).closest(".lamp-bead")) return;
    setLit(true);
  }

  return (
    <div className="lamp-reveal" onFocusCapture={handleFocusCapture}>
      <span className={`lamp-room-dark ${lit ? "" : "is-active"}`} aria-hidden="true" />
      <span className={`lamp-glow-pool ${lit ? "is-lit" : ""}`} aria-hidden="true" />

      <div className="lamp-fixture" aria-hidden="true">
        <svg
          width="120"
          height="46"
          viewBox="0 0 120 46"
          className="lamp-svg"
        >
          <defs>
            <radialGradient id="domeLit" cx="40%" cy="15%" r="85%">
              <stop offset="0%" stopColor="#fffaf0" />
              <stop offset="55%" stopColor="#ffe0a6" />
              <stop offset="100%" stopColor="#f5b96e" />
            </radialGradient>
          </defs>

          {/* base shade (always visible, neutral) */}
          <path
            d="M26 36 C26 12 42 0 60 0 C78 0 94 12 94 36 Z"
            className="lamp-shade-base"
            stroke="var(--border-color)"
            strokeWidth="2"
          />
          {/* lit overlay crossfades in on top for a smooth on/off transition */}
          <path
            d="M26 36 C26 12 42 0 60 0 C78 0 94 12 94 36 Z"
            fill="url(#domeLit)"
            className={`lamp-shade-lit ${lit ? "is-lit" : ""}`}
          />

          <ellipse cx="60" cy="36" rx="34" ry="4.5" className="lamp-rim" stroke="var(--border-color)" strokeWidth="1.5" />
          <circle cx="60" cy="39" r="6.5" className={`lamp-bulb ${lit ? "is-lit" : ""}`} />
        </svg>

        <div className="lamp-cord">
          <span
            className="lamp-cord-line"
            style={{ height: 26 + dragY }}
          />
          <button
            type="button"
            className="lamp-bead"
            aria-pressed={lit}
            aria-label={
              lit
                ? "Turn off the desk lamp"
                : "Pull the cord to reveal the application form"
            }
            onPointerDown={handlePointerDown}
            onClick={handleClick}
          />
        </div>

        {lit && <span key={sparkKey} className="lamp-spark" />}
      </div>

      {!lit && (
        <div className="lamp-hint">
          <p>Ready to join the team? Pull the cord to begin.</p>
        </div>
      )}

      <div className={`lamp-stage ${lit ? "is-lit" : ""}`}>
        <div className="lamp-content">{children}</div>
      </div>
    </div>
  );
}
