"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type Option = { value: string; label: string };

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
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
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

  const selected = options.find((o) => o.value === value);

  return (
    <div className="custom-select" ref={rootRef}>
      <button
        type="button"
        id={id}
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

      {open && (
        <ul className="custom-select-menu" role="listbox" tabIndex={-1}>
          {options.map((o) => (
            <li key={o.value} role="option" aria-selected={o.value === value}>
              <button
                type="button"
                className={`custom-select-option ${o.value === value ? "is-selected" : ""}`}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
