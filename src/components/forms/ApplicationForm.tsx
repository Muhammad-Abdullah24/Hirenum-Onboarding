"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase/client";
import { guardianOptions } from "@/lib/guardians";
import { Select } from "@/components/ui/Select";

export function ApplicationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [guardian, setGuardian] = useState("");
  const [cnicFile, setCnicFile] = useState<File | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!guardian) {
      setError("Please select a guardian.");
      return;
    }

    if (!cnicFile) {
      setError("Please upload a photo of your CNIC.");
      return;
    }

    setLoading(true);
    try {
      const fileExt = cnicFile.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("cnic-photos")
        .upload(filePath, cnicFile, { upsert: false });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("cnic-photos").getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("applicants").insert({
        full_name: fullName,
        phone,
        email,
        guardian,
        cnic_photo_url: publicUrl,
        status: "applied",
      });

      if (insertError) throw insertError;

      router.push("/apply/success");
    } catch (err) {
      console.error(err);
      setError(
        "Something went wrong submitting your application. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="field-label" htmlFor="full_name">
          Full name
        </label>
        <input
          id="full_name"
          className="field-input"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="field-label" htmlFor="phone">
            Phone number
          </label>
          <input
            id="phone"
            className="field-input"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="03xx-xxxxxxx"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="field-input"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="guardian">
          Guardian
        </label>
        <Select
          id="guardian"
          options={guardianOptions}
          value={guardian}
          onChange={setGuardian}
          placeholder="Select guardian"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="cnic">
          CNIC photo
        </label>
        <input
          id="cnic"
          type="file"
          accept="image/*"
          required
          className="field-input"
          onChange={(e) => setCnicFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {error && (
        <p className="text-sm" style={{ color: "#e24b4a" }}>
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        <span>{loading ? "Submitting..." : "Submit"}</span>
      </button>
    </form>
  );
}
