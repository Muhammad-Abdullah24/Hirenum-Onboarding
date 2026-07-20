import Link from "next/link";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { GlowOrbs } from "@/components/layout/GlowOrbs";
import { GlassCard } from "@/components/ui/GlassCard";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { domains } from "@/lib/domains";

const steps = [
  { n: "01", title: "Apply", desc: "Submit your details and CNIC in a couple of minutes." },
  { n: "02", title: "Review", desc: "Our team reviews applications and shortlists candidates." },
  { n: "03", title: "Offer", desc: "Shortlisted candidates receive a personalized offer letter." },
  { n: "04", title: "Sign", desc: "Review the terms and sign electronically." },
  { n: "05", title: "Onboard", desc: "You're in. Welcome to the team." },
];

export default function HomePage() {
  return (
    <>
      <Nav />

      <main className="relative overflow-hidden dot-grid">
        <GlowOrbs />

        <section className="section relative z-10">
          <div className="container-page text-center max-w-3xl mx-auto">
            <div className="anim-fade-up-1 mb-4">
              <Eyebrow>Careers &amp; onboarding</Eyebrow>
            </div>
            <h1 className="hero-headline anim-fade-up-2 mb-6">
              Everything starts here at Hirenum.
            </h1>
            <p
              className="anim-fade-up-3 mb-8 text-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              Whether you&apos;re applying to join the team or getting set up
              as a new hire, this is where it happens.
            </p>
            <div className="anim-fade-up-4 flex flex-wrap items-center justify-center gap-4">
              <Link href="/apply" className="btn btn-primary">
                <span>Apply for a role</span>
              </Link>
              <Link href="/onboarding" className="btn btn-ghost">
                <span>Go to onboarding</span>
              </Link>
            </div>
          </div>
        </section>

        <section id="roles" className="section relative z-10">
          <div className="container-page">
            <Eyebrow>Team &amp; roles</Eyebrow>
            <h2 className="text-3xl mt-3 mb-10">Where you could fit in</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {domains.map((d) => (
                <GlassCard key={d.slug}>
                  <h3 className="text-lg mb-2">{d.label}</h3>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {d.description}
                  </p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="section relative z-10">
          <div className="container-page">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="text-3xl mt-3 mb-10">From application to day one</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {steps.map((s) => {
                const content = (
                  <>
                    <div
                      className="text-sm mb-2"
                      style={{ color: "var(--accent)", fontWeight: 700 }}
                    >
                      {s.n}
                    </div>
                    <h3 className="text-base mb-2">{s.title}</h3>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {s.desc}
                    </p>
                  </>
                );
                return s.title === "Onboard" ? (
                  <Link key={s.n} href="/onboarding" className="hover-underline block">
                    {content}
                  </Link>
                ) : (
                  <div key={s.n}>{content}</div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
