import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { GlowOrbs } from "@/components/layout/GlowOrbs";
import { GlassCard } from "@/components/ui/GlassCard";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Page Not Found | Hirenum",
};

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="relative overflow-hidden min-h-[70vh] flex items-center">
        <GlowOrbs />
        <section className="section relative z-10 w-full">
          <div className="container-page max-w-lg mx-auto text-center">
            <GlassCard className="anim-fade-up-1">
              <Eyebrow>404</Eyebrow>
              <h1 className="text-3xl mt-3 mb-4">This page doesn&apos;t exist.</h1>
              <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
                The page you&apos;re looking for may have been moved or never
                existed. Let&apos;s get you back on track.
              </p>
              <Link href="/" className="btn btn-ghost">
                <span>Back to home</span>
              </Link>
            </GlassCard>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
