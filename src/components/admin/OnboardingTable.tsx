"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  IdCard,
  Phone,
  Landmark,
  ShieldCheck,
  GraduationCap,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  Inbox,
  LucideIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { OnboardingSubmission, OnboardingStatus } from "@/lib/onboarding";
import { AdminAvatar } from "@/components/admin/AdminAvatar";

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
      <button type="button" className="admin-doc-link" onClick={open} disabled={loading}>
        {loading ? "Loading..." : "View"} {!loading && <ExternalLink size={12} />}
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

function DetailSection({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-detail-section">
      <div className="admin-detail-section-title">
        <Icon size={15} />
        <span>{title}</span>
      </div>
      <div className="onboarding-detail-grid">{children}</div>
    </div>
  );
}

function SubmissionDetail({
  submission,
  onStatusChange,
  onBack,
}: {
  submission: OnboardingSubmission;
  onStatusChange: (id: string, status: OnboardingStatus) => void;
  onBack: () => void;
}) {
  const s = submission;
  return (
    <div className="glass-card admin-detail-panel">
      <button type="button" className="admin-detail-back" onClick={onBack}>
        <ArrowLeft size={14} /> Back to list
      </button>

      <div className="admin-detail-header">
        <AdminAvatar name={s.full_name} size={48} />
        <div className="admin-detail-header-text">
          <p className="admin-detail-header-name">{s.full_name}</p>
          <p className="admin-table-subtle">
            {s.email} · Submitted {new Date(s.created_at).toLocaleDateString()}
          </p>
        </div>
        <span className={`badge badge-${s.status === "reviewed" ? "completed" : "applied"}`}>
          {s.status === "reviewed" ? "Reviewed" : "Submitted"}
        </span>
      </div>

      {s.status !== "reviewed" && (
        <button
          className="btn btn-primary admin-detail-mark-reviewed"
          onClick={() => onStatusChange(s.id, "reviewed")}
        >
          <CheckCircle2 size={15} />
          <span>Mark reviewed</span>
        </button>
      )}

      <div className="admin-detail-sections">
        <DetailSection icon={IdCard} title="Identity & personal details">
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
        </DetailSection>

        <DetailSection icon={Phone} title="Contact information">
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
        </DetailSection>

        <DetailSection icon={Landmark} title="Payroll & tax">
          <DetailField label="Bank name" value={s.bank_name} />
          <DetailField label="Branch" value={s.bank_branch} />
          <DetailField label="Account title" value={s.account_title} />
          <DetailField label="Account number" value={s.account_number} />
          <DetailField label="IBAN" value={s.iban} />
          <DetailField label="FBR filer status" value={s.fbr_filer_status} />
        </DetailSection>

        <DetailSection icon={ShieldCheck} title="Statutory & benefits">
          <DetailField
            label="Nominee"
            value={`${s.nominee_name} (${s.nominee_relationship}) — ${s.nominee_cnic}`}
          />
          <DetailField label="Blood group" value={s.blood_group} />
        </DetailSection>

        <DetailSection icon={GraduationCap} title="Employment & education">
          <DocumentLink path={s.offer_letter_path} label="Signed offer letter" />
          <DocumentLink path={s.university_proof_path} label="University proof" />
          {s.degree_certificate_paths.map((path, i) => (
            <DocumentLink key={path} path={path} label={`Degree certificate ${i + 1}`} />
          ))}
        </DetailSection>
      </div>
    </div>
  );
}

export function OnboardingTable() {
  const [submissions, setSubmissions] = useState<OnboardingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<OnboardingStatus | "all">("all");
  const [query, setQuery] = useState("");

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

  const counts = useMemo(
    () => ({
      all: submissions.length,
      submitted: submissions.filter((s) => s.status === "submitted").length,
      reviewed: submissions.filter((s) => s.status === "reviewed").length,
    }),
    [submissions]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return submissions.filter((s) => {
      if (filter !== "all" && s.status !== filter) return false;
      if (!q) return true;
      return s.full_name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    });
  }, [submissions, filter, query]);

  const selected = submissions.find((s) => s.id === selectedId) ?? null;

  if (loading) {
    return (
      <div className="admin-skeleton-list">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="admin-skeleton-row" />
        ))}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="admin-empty">
        <Inbox size={28} className="admin-empty-icon" />
        <p>No onboarding submissions yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-stat-row">
        <button
          type="button"
          className={`admin-stat-tile ${filter === "all" ? "is-active" : ""}`}
          onClick={() => setFilter("all")}
        >
          <span className="admin-stat-value">{counts.all}</span>
          <span className="admin-stat-label">All</span>
        </button>
        <button
          type="button"
          className={`admin-stat-tile admin-stat-tile-applied ${filter === "submitted" ? "is-active" : ""}`}
          onClick={() => setFilter("submitted")}
        >
          <span className="admin-stat-value">{counts.submitted}</span>
          <span className="admin-stat-label">Submitted</span>
        </button>
        <button
          type="button"
          className={`admin-stat-tile admin-stat-tile-completed ${filter === "reviewed" ? "is-active" : ""}`}
          onClick={() => setFilter("reviewed")}
        >
          <span className="admin-stat-value">{counts.reviewed}</span>
          <span className="admin-stat-label">Reviewed</span>
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={15} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="admin-search-input"
          />
        </div>
        <p className="admin-toolbar-count">
          {visible.length} of {submissions.length}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
        <div className={`admin-onboarding-list ${selectedId ? "hidden lg:block" : ""}`}>
          {visible.length === 0 ? (
            <div className="admin-empty">
              <Inbox size={24} className="admin-empty-icon" />
              <p>No submissions match this view.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {visible.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`admin-onboarding-list-row ${s.id === selectedId ? "is-active" : ""}`}
                  onClick={() => setSelectedId(s.id)}
                >
                  <AdminAvatar name={s.full_name} size={36} />
                  <div className="admin-onboarding-list-row-text">
                    <p className="admin-table-name">{s.full_name}</p>
                    <p className="admin-table-subtle">
                      {s.email} · {new Date(s.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`badge badge-${s.status === "reviewed" ? "completed" : "applied"}`}>
                    {s.status === "reviewed" ? "Reviewed" : "Submitted"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={`admin-onboarding-detail ${selectedId ? "block" : "hidden lg:block"}`}>
          {selected ? (
            <SubmissionDetail
              submission={selected}
              onStatusChange={handleStatusChange}
              onBack={() => setSelectedId(null)}
            />
          ) : (
            <div className="glass-card admin-detail-empty">
              <Inbox size={28} className="admin-empty-icon" />
              <p>Select a submission to view full details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
