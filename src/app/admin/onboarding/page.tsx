"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { OnboardingTable } from "@/components/admin/OnboardingTable";

export default function AdminOnboardingPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecked(true);
      if (!data.session) router.push("/admin/login");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) router.push("/admin/login");
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  if (!checked || !session) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p style={{ color: "var(--text-secondary)" }}>Checking access...</p>
      </main>
    );
  }

  return (
    <main className="container-page section">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Eyebrow>HR dashboard</Eyebrow>
          <h1 className="text-3xl mt-3">Onboarding</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="btn btn-ghost">
            <span>Applicants</span>
          </Link>
          <button
            className="btn btn-ghost"
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/admin/login");
            }}
          >
            <span>Sign out</span>
          </button>
        </div>
      </div>
      <OnboardingTable />
    </main>
  );
}
