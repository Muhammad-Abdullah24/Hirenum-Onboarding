"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GlowOrbs } from "@/components/layout/GlowOrbs";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/admin");
    } catch (err) {
      console.error(err);
      setError("Couldn't reach the server. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative overflow-hidden min-h-screen flex items-center justify-center">
      <GlowOrbs />
      <div className="container-page max-w-sm relative z-10">
        <GlassCard>
          <Eyebrow>HR access</Eyebrow>
          <h1 className="text-2xl mt-3 mb-6">Sign in</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="field-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="field-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-sm" style={{ color: "#e24b4a" }}>
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              <span>{loading ? "Signing in..." : "Sign in"}</span>
            </button>
          </form>
          <p className="text-sm mt-6 text-center opacity-70">
            First time? <Link href="/admin/signup">Create your account</Link>
          </p>
        </GlassCard>
      </div>
    </main>
  );
}
