import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { GlowOrbs } from "@/components/layout/GlowOrbs";
import { GlassCard } from "@/components/ui/GlassCard";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { LampReveal } from "@/components/forms/LampReveal";

export default function ApplyPage() {
  return (
    <>
      <Nav forceDarkTheme />
      <main className="relative overflow-hidden">
        <GlowOrbs />
        <section className="section relative z-10">
          <div className="container-page max-w-xl mx-auto">
            <LampReveal>
              <GlassCard className="anim-fade-up-2">
                <ApplicationForm />
              </GlassCard>
            </LampReveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
