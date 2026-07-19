"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { OnboardingSubmission, OnboardingStatus } from "@/lib/onboarding";

const SIGNED_URL_TTL = 60;

function DocumentLink({ path, label }: { path: string | null; label: string }) {
  const [loading, setLoading] = useState(false);

  if (!path) {
    return (
      <div>
        <p className="detail-label">{label}</p>
        <p style={{ color: "var(--text-secondary)" }}>—</p>
      </div>
    );
  }

  async function open() {
    setLoading(true);
    const { data, error } = await supabase.storage
      .from("onboarding-documents")
      .createSignedUrl(path as string, SIGNED_URL_TTL);
    setLoading(false);
    if (!error && data) window.open(data.signedUrl, "_blank", "noreferrer");
  }

  return (
    <div>
      <p className="detail-label">{label}</p>
      <button
        type="button"
        className="hover-underline"
        style={{ color: "var(--accent)" }}
        onClick={open}
        disabled={loading}
      >
        {loading ? "Loading..." : "View"}
      </button>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="detail-label">{label}</p>
      <p>{value || "—"}</p>
    </div>
  );
}

function SubmissionRow({
  submission,
  onStatusChange,
}: {
  submission: OnboardingSubmission;
  onStatusChange: (id: string, status: OnboardingStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const s = submission;

  return (
    <div className="glass-card onboarding-row">
      <button
        type="button"
        className="onboarding-row-header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div>
          <p className="onboarding-row-name">{s.full_name}</p>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
            {s.email} · {new Date(s.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`badge badge-${s.status === "reviewed" ? "completed" : "applied"}`}>
            {s.status === "reviewed" ? "Reviewed" : "Submitted"}
          </span>
          <ChevronDown size={16} className={`onboarding-row-chevron ${open ? "is-open" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="onboarding-row-body">
          <div>
            <h3 className="onboarding-row-section-title">Identity & personal details</h3>
            <div className="onboarding-detail-grid">
              <DetailField label="Full name" value={s.full_name} />
              <DetailField label="Father's / husband's name" value={s.guardian_name} />
              <DetailField label="CNIC number" value={s.cnic_number} />
              <DetailField label="Date of birth" value={s.date_of_birth} />
              <DetailField label="Gender" value={s.gender} />
              <DetailField label="Marital status" value={s.marital_status} />
              <DetailField label="Nationality" value={s.nationality} />
              <DocumentLink path={s.cnic_front_path} label="CNIC (front)" />
              <DocumentLink path={s.cnic_back_path} label="CNIC (back)" />
              <DocumentLink path={s.passport_photo_path} label="Passport photo" />
              <DocumentLink path={s.posts_photo_path} label="Posts photo" />
            </div>
          </div>

          <div>
            <h3 className="onboarding-row-section-title">Contact information</h3>
            <div className="onboarding-detail-grid">
              <DetailField label="Phone" value={s.phone} />
              <DetailField label="Father's / husband's phone" value={s.guardian_phone} />
              <DetailField label="Email" value={s.email} />
              <DetailField label="Current address" value={s.current_address} />
              <DetailField label="Permanent address" value={s.permanent_address} />
              <DetailField
                label="Emergency contact"
                value={`${s.emergency_contact_1_name} (${s.emergency_contact_1_relationship}) — ${s.emergency_contact_1_phone}`}
              />
              {s.emergency_contact_2_name && (
                <DetailField
                  label="Second emergency contact"
                  value={`${s.emergency_contact_2_name} (${s.emergency_contact_2_relationship}) — ${s.emergency_contact_2_phone}`}
                />
              )}
            </div>
          </div>

          <div>
            <h3 className="onboarding-row-section-title">Payroll & tax</h3>
            <div className="onboarding-detail-grid">
              <DetailField label="Bank name" value={s.bank_name} />
              <DetailField label="Branch" value={s.bank_branch} />
              <DetailField label="Account title" value={s.account_title} />
              <DetailField label="Account number" value={s.account_number} />
              <DetailField label="IBAN" value={s.iban} />
              <DetailField label="FBR filer status" value={s.fbr_filer_status} />
            </div>
          </div>

          <div>
            <h3 className="onboarding-row-section-title">Statutory & benefits</h3>
            <div className="onboarding-detail-grid">
              <DetailField
                label="Nominee"
                value={`${s.nominee_name} (${s.nominee_relationship}) — ${s.nominee_cnic}`}
              />
              <DetailField label="Blood group" value={s.blood_group} />
            </div>
          </div>

          <div>
            <h3 className="onboarding-row-section-title">Employment & education</h3>
            <div className="onboarding-detail-grid">
              <DocumentLink path={s.offer_letter_path} label="Signed offer letter" />
              <DocumentLink path={s.university_proof_path} label="University proof" />
              {s.degree_certificate_paths.map((path, i) => (
                <DocumentLink key={path} path={path} label={`Degree certificate ${i + 1}`} />
              ))}
            </div>
          </div>

          {s.status !== "reviewed" && (
            <button
              className="btn btn-primary"
              style={{ padding: "0.4rem 1rem", fontSize: "12px" }}
              onClick={() => onStatusChange(s.id, "reviewed")}
            >
              <span>Mark reviewed</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function OnboardingTable() {
  const [submissions, setSubmissions] = useState<OnboardingSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("onboarding_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setSubmissions(data as OnboardingSubmission[]);
      setLoading(false);
    }
    load();
  }, []);

  async function handleStatusChange(id: string, status: OnboardingStatus) {
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    await supabase.from("onboarding_submissions").update({ status }).eq("id", id);
  }

  if (loading) {
    return <p style={{ color: "var(--text-secondary)" }}>Loading submissions...</p>;
  }

  if (submissions.length === 0) {
    return (
      <p style={{ color: "var(--text-secondary)" }}>
        No onboarding submissions yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((s) => (
        <SubmissionRow key={s.id} submission={s} onStatusChange={handleStatusChange} />
      ))}
    </div>
  );
}
