"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, IdCard, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Eyebrow } from "@/components/ui/Eyebrow";

const navItems = [
  { href: "/admin", label: "Applicants", icon: Users },
  { href: "/admin/onboarding", label: "Onboarding", icon: IdCard },
];

export function AdminShell({
  eyebrow,
  title,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar hidden lg:flex">
        <Link href="/admin" className="admin-sidebar-brand">
          <span className="admin-sidebar-logo">H</span>
          <span>
            <span className="admin-sidebar-brand-name">Hirenum</span>
            <span className="admin-sidebar-brand-sub">Admin</span>
          </span>
        </Link>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-sidebar-link ${active ? "is-active" : ""}`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <ThemeToggle />
          <button type="button" className="admin-sidebar-signout" onClick={signOut}>
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <nav className="admin-mobile-nav flex lg:hidden">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-mobile-link ${active ? "is-active" : ""}`}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="admin-mobile-nav-spacer" />
          <ThemeToggle />
          <button
            type="button"
            className="admin-mobile-signout"
            onClick={signOut}
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </nav>

        <header className="admin-topbar">
          <div>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="admin-title">{title}</h1>
          </div>
          {actions && <div className="admin-topbar-actions">{actions}</div>}
        </header>

        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
