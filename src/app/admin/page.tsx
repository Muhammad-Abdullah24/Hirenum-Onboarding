"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { ApplicantsTable } from "@/components/admin/ApplicantsTable";

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setChecked(true);
        router.push("/admin/login");
        return;
      }
      if (data.session.user.user_metadata?.password_set === false) {
        router.push("/admin/signup");
        return;
      }
      setSession(data.session);
      setChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) router.push("/admin/login");
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  if (!checked || !session) {
    return (
      <main className="admin-loading">
        <div className="admin-loading-spinner" />
        <p style={{ color: "var(--text-secondary)" }}>Checking access...</p>
      </main>
    );
  }

  return (
    <AdminShell eyebrow="HR dashboard" title="Applicants">
      <ApplicantsTable />
    </AdminShell>
  );
}
