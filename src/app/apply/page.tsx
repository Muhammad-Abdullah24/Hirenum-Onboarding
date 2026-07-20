import type { Metadata } from "next";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { AuroraBackground } from "@/components/layout/AuroraBackground";
import { GlassCard } from "@/components/ui/GlassCard";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TiltCard } from "@/components/ui/TiltCard";
import { ComingSoon } from "@/components/forms/ComingSoon";
import { LampReveal } from "@/components/forms/LampReveal";

export const metadata: Metadata = {
  title: "Careers | Hirenum",
  description: "Applications aren't open right now — check back soon.",
};

const HEADLINE_WORDS: (string | { text: string; accent: true })[] = [
  "Let's",
  "build",
  "something",
  { text: "great", accent: true },
  "together.",
];

export default function ApplyPage() {
  return (
    <>
      <Nav forceDarkTheme />
      <main className="relative overflow-hidden">
        <AuroraBackground />
        <section className="section relative z-10">
          <div className="container-page max-w-6xl mx-auto">
            <div className="apply-hero-grid">
              <div className="apply-story-panel">
                <Eyebrow>Careers at Hirenum</Eyebrow>
                <h1 className="hero-headline mt-4">
                  {HEADLINE_WORDS.map((word, i) => {
                    const isAccent = typeof word === "object";
                    const text = isAccent ? word.text : word;
                    return (
                      <span
                        key={i}
                        className={`kinetic-word ${isAccent ? "text-gradient-brand" : ""}`}
                        style={{ animationDelay: `${i * 70}ms` }}
                      >
                        {text}
                      </span>
                    );
                  })}
                </h1>
                <p className="apply-story-copy anim-fade-up-3">
                  We&apos;re a small team that ships real work. No busywork,
                  no bloated process &mdash; just people who care, building
                  things that matter.
                </p>
                <div className="anim-fade-up-4">
                  <TiltCard />
                </div>
              </div>

              <div className="apply-action-panel">
                <LampReveal>
                  <GlassCard className="anim-fade-up-2">
                    <ComingSoon />
                  </GlassCard>
                </LampReveal>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
