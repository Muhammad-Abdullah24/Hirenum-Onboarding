import type { Metadata } from "next";
import { Layers, Clock, ShieldCheck } from "lucide-react";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { AuroraBackground } from "@/components/layout/AuroraBackground";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { OnboardingForm } from "@/components/forms/OnboardingForm";

export const metadata: Metadata = {
  title: "Employee Onboarding | Hirenum",
  description: "A few details for HR and payroll to get you set up.",
};

const HEADLINE_WORDS: (string | { text: string; accent: true })[] = [
  "Let's",
  "get",
  "you",
  { text: "onboarded", accent: true },
];

export default function OnboardingPage() {
  return (
    <>
      <Nav />
      <main className="relative">
        <AuroraBackground />
        <section className="section relative z-10">
          <div className="container-page max-w-4xl mx-auto">
            <div className="text-center mb-10 anim-fade-up-1">
              <Eyebrow>Welcome to Hirenum</Eyebrow>
              <h1 className="hero-headline mt-4">
                {HEADLINE_WORDS.map((word, i) => {
                  const isAccent = typeof word === "object";
                  const text = isAccent ? word.text : word;
                  const isLast = i === HEADLINE_WORDS.length - 1;
                  return (
                    <span
                      key={i}
                      className={`kinetic-word ${isAccent ? "text-gradient-brand" : ""} ${isLast ? "kinetic-word-tight" : ""}`}
                      style={{ animationDelay: `${i * 70}ms` }}
                    >
                      {text}
                    </span>
                  );
                })}
                <span
                  className="kinetic-word kinetic-word-period"
                  style={{ animationDelay: `${HEADLINE_WORDS.length * 70}ms` }}
                >
                  .
                </span>
              </h1>
              <p className="apply-story-copy mx-auto anim-fade-up-3">
                A few details for HR and payroll. Your progress is saved as
                you go, so feel free to gather documents and come back.
              </p>
              <div className="onboarding-trust-row anim-fade-up-4">
                <span className="onboarding-trust-chip">
                  <Layers size={14} aria-hidden="true" />
                  5 quick sections
                </span>
                <span className="onboarding-trust-chip">
                  <Clock size={14} aria-hidden="true" />
                  About 10 minutes
                </span>
                <span className="onboarding-trust-chip">
                  <ShieldCheck size={14} aria-hidden="true" />
                  Encrypted, HR-only access
                </span>
              </div>
            </div>
            <div className="anim-fade-up-2">
              <OnboardingForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
