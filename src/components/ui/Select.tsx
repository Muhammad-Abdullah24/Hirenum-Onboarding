"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

type Option = { value: string; label: string };

type MenuPos = { top: number; left: number; width: number; placement: "bottom" | "top" };

export function Select({
  id,
  options,
  value,
  onChange,
  placeholder = "Select...",
}: {
  id?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node;
      const insideTrigger = rootRef.current && rootRef.current.contains(target);
      const insideMenu = menuRef.current && menuRef.current.contains(target);
      if (!insideTrigger && !insideMenu) setOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Dropdown menu is portaled to <body> and positioned via getBoundingClientRect
  // instead of relying on CSS position:absolute inside the trigger. Each
  // .form-section card has its own stacking context (backdrop-filter creates
  // one), so a later card in the DOM would otherwise paint over an earlier
  // card's open menu no matter what z-index the menu had.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    function reposition() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const menuHeight = menuRef.current?.offsetHeight ?? 260;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < menuHeight + 12 && rect.top > menuHeight + 12;
      setMenuPos({
        top: openUpward ? rect.top - 8 - menuHeight : rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        placement: openUpward ? "top" : "bottom",
      });
    }

    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="custom-select" ref={rootRef}>
      <button
        type="button"
        id={id}
        ref={triggerRef}
        className={`custom-select-trigger ${open ? "is-open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={selected ? "" : "custom-select-placeholder"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className="custom-select-chevron" aria-hidden="true" />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <ul
            ref={menuRef}
            role="listbox"
            tabIndex={-1}
            className={`custom-select-menu custom-select-menu-${menuPos?.placement ?? "bottom"}`}
            style={{
              position: "fixed",
              top: menuPos?.top ?? -9999,
              left: menuPos?.left ?? -9999,
              width: menuPos?.width,
              visibility: menuPos ? "visible" : "hidden",
            }}
          >
            {options.map((o, i) => (
              <li key={o.value} role="option" aria-selected={o.value === value}>
                <button
                  type="button"
                  className={`custom-select-option ${o.value === value ? "is-selected" : ""}`}
                  style={{ animationDelay: `${i * 28}ms` }}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                >
                  {o.label}
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )}
    </div>
  );
}
