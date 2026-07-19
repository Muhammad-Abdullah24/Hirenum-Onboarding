import Link from "next/link";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { GlowOrbs } from "@/components/layout/GlowOrbs";
import { GlassCard } from "@/components/ui/GlassCard";
import { Eyebrow } from "@/components/ui/Eyebrow";

export default function SuccessPage() {
  return (
    <>
      <Nav />
      <main className="relative overflow-hidden">
        <GlowOrbs />
        <section className="section relative z-10">
          <div className="container-page max-w-lg mx-auto text-center">
            <GlassCard className="anim-fade-up-1">
              <Eyebrow>Application received</Eyebrow>
              <h1 className="text-3xl mt-3 mb-4">Thanks for applying.</h1>
              <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
                We&apos;ve got your details. If you&apos;re shortlisted, we&apos;ll
                reach out by email with next steps.
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
