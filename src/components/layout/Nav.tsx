"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/#roles", label: "Team & Roles" },
  { href: "/#process", label: "How It Works" },
  { href: "/onboarding", label: "Onboarding" },
];

export function Nav({ forceDarkTheme = false }: { forceDarkTheme?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const { setTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (forceDarkTheme) setTheme("dark");
  }, [forceDarkTheme, setTheme]);

  return (
    <nav className={`site-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="container-page flex items-center justify-between w-full">
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/hirenum-logo.png"
            alt="Hirenum"
            width={196}
            height={40}
            priority
            style={{ height: "32px", width: "auto" }}
          />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover-underline text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {!forceDarkTheme && <ThemeToggle />}
          <Link href="/apply" className="btn btn-primary">
            <span>Apply now</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
