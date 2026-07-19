import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { OnboardingForm } from "@/components/forms/OnboardingForm";

export default function OnboardingPage() {
  return (
    <>
      <Nav />
      <main className="relative">
        <section className="section relative z-10">
          <div className="container-page max-w-4xl mx-auto">
            <div className="text-center mb-10 anim-fade-up-1">
              <Eyebrow>Welcome to Hirenum</Eyebrow>
              <h1 className="text-3xl mt-3">Let&apos;s get you onboarded</h1>
              <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
                A few details for HR and payroll. Your progress is saved as you go,
                so feel free to gather documents and come back.
              </p>
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
