"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GlowOrbs } from "@/components/layout/GlowOrbs";

// TEMPORARY: remove this page (and the allow-list below) once
// muhammad@hirenum.com and noor@hirenum.com have set their passwords.
const ALLOWED_EMAILS = ["muhammad@hirenum.com", "noor@hirenum.com"];

type Step = "email" | "otp" | "password";

export default function AdminSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const normalized = email.trim().toLowerCase();
    if (!ALLOWED_EMAILS.includes(normalized)) {
      setError("This email isn't authorized to create an admin account.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalized,
        options: { shouldCreateUser: true },
      });
      if (error) {
        setError(error.message);
        return;
      }
      setEmail(normalized);
      setStep("otp");
    } catch (err) {
      console.error(err);
      setError("Couldn't reach the server. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp.trim(),
        type: "email",
      });
      if (error) {
        setError(error.message);
        return;
      }
      setStep("password");
    } catch (err) {
      console.error(err);
      setError("Couldn't reach the server. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
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
          <h1 className="text-2xl mt-3 mb-6">
            {step === "email" && "Create your account"}
            {step === "otp" && "Verify your email"}
            {step === "password" && "Set a password"}
          </h1>

          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="field-label" htmlFor="email">
                  Work email
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
              {error && (
                <p className="text-sm" style={{ color: "#e24b4a" }}>
                  {error}
                </p>
              )}
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                <span>{loading ? "Sending code..." : "Send code"}</span>
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <p className="text-sm opacity-70">We sent a 6-digit code to {email}.</p>
              <div>
                <label className="field-label" htmlFor="otp">
                  Verification code
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  className="field-input"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              {error && (
                <p className="text-sm" style={{ color: "#e24b4a" }}>
                  {error}
                </p>
              )}
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                <span>{loading ? "Verifying..." : "Verify"}</span>
              </button>
            </form>
          )}

          {step === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="field-label" htmlFor="password">
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  className="field-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label" htmlFor="confirmPassword">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  className="field-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {error && (
                <p className="text-sm" style={{ color: "#e24b4a" }}>
                  {error}
                </p>
              )}
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                <span>{loading ? "Saving..." : "Set password & sign in"}</span>
              </button>
            </form>
          )}

          <p className="text-sm mt-6 text-center opacity-70">
            <Link href="/admin/login">Back to sign in</Link>
          </p>
        </GlassCard>
      </div>
    </main>
  );
}
