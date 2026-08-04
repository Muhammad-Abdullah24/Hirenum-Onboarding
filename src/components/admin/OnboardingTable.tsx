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
  Download,
  ImageOff,
  FileText,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import {
  OnboardingSubmission,
  OnboardingStatus,
  genderOptions,
  maritalStatusOptions,
  fbrFilerOptions,
  bloodGroupOptions,
} from "@/lib/onboarding";
import { AdminAvatar } from "@/components/admin/AdminAvatar";
import { EditableField } from "@/components/admin/EditableField";

const SIGNED_URL_TTL = 60;

const STATUS_BADGE: Record<OnboardingStatus, { label: string; className: string }> = {
  pending: { label: "Incomplete", className: "badge-pending" },
  submitted: { label: "Submitted", className: "badge-applied" },
  reviewed: { label: "Reviewed", className: "badge-completed" },
};

function DocumentLink({ path, label }: { path: string | null; label: string }) {
  const [loading, setLoading] = useState(false);

  if (!path) {
    return (
      <div>
        <p className="detail-label">{label}</p>
        <p style={{ color: "var(--text-secondary)" }}>–</p>
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

function PhotoField({ path, label }: { path: string | null; label: string }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    setPreviewUrl(null);
    setFailed(false);
    supabase.storage
      .from("onboarding-documents")
      .createSignedUrl(path, SIGNED_URL_TTL)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setFailed(true);
          return;
        }
        setPreviewUrl(data.signedUrl);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (!path) {
    return (
      <div>
        <p className="detail-label">{label}</p>
        <p style={{ color: "var(--text-secondary)" }}>–</p>
      </div>
    );
  }

  async function handleDownload() {
    setDownloading(true);
    const filename = path!.split("/").pop() || "photo.jpg";
    const { data, error } = await supabase.storage
      .from("onboarding-documents")
      .createSignedUrl(path as string, SIGNED_URL_TTL, { download: filename });
    setDownloading(false);
    if (!error && data) window.open(data.signedUrl, "_blank", "noreferrer");
  }

  return (
    <div>
      <p className="detail-label">{label}</p>
      <div className="admin-photo-field">
        {failed ? (
          <div className="admin-photo-thumb admin-photo-thumb-error">
            <ImageOff size={18} />
          </div>
        ) : previewUrl ? (
          <button
            type="button"
            className="admin-photo-thumb"
            onClick={() => window.open(previewUrl, "_blank", "noreferrer")}
            title="Open full size"
          >
            <img src={previewUrl} alt={label} onError={() => setFailed(true)} />
          </button>
        ) : (
          <div className="admin-photo-thumb admin-skeleton-row" />
        )}
        <button
          type="button"
          className="admin-doc-link"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? "Preparing..." : "Download"} {!downloading && <Download size={12} />}
        </button>
      </div>
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
        <span className="admin-detail-section-icon">
          <Icon size={14} />
        </span>
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

function SubmissionDetail({
  submission,
  onStatusChange,
  onFieldSave,
  onBack,
}: {
  submission: OnboardingSubmission;
  onStatusChange: (id: string, status: OnboardingStatus) => void;
  onFieldSave: (id: string, field: keyof OnboardingSubmission, value: string) => Promise<void>;
  onBack: () => void;
}) {
  const s = submission;
  const save = (field: keyof OnboardingSubmission) => (value: string) =>
    onFieldSave(s.id, field, value);
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
        <div className="admin-detail-header-actions">
          <span className={`badge ${STATUS_BADGE[s.status].className}`}>
            {STATUS_BADGE[s.status].label}
          </span>
          {s.status !== "reviewed" && (
            <button
              type="button"
              className="btn btn-primary admin-detail-mark-reviewed"
              onClick={() => onStatusChange(s.id, "reviewed")}
            >
              <CheckCircle2 size={15} />
              <span>Mark reviewed</span>
            </button>
          )}
        </div>
      </div>

      <div className="admin-detail-sections">
        <DetailSection icon={IdCard} title="Identity & personal details">
          <div className="onboarding-detail-grid">
            <EditableField label="Full name" value={s.full_name} onSave={save("full_name")} />
            <EditableField
              label="Father's / husband's name"
              value={s.guardian_name}
              onSave={save("guardian_name")}
            />
            <EditableField label="CNIC number" value={s.cnic_number} onSave={save("cnic_number")} />
            <EditableField
              label="Date of birth"
              value={s.date_of_birth}
              onSave={save("date_of_birth")}
              type="date"
            />
            <EditableField
              label="Gender"
              value={s.gender}
              onSave={save("gender")}
              options={genderOptions}
            />
            <EditableField
              label="Marital status"
              value={s.marital_status}
              onSave={save("marital_status")}
              options={maritalStatusOptions}
            />
            <EditableField label="Nationality" value={s.nationality} onSave={save("nationality")} />
          </div>
          <div className="onboarding-detail-documents">
            <DocumentLink path={s.cnic_front_path} label="CNIC (front)" />
            <DocumentLink path={s.cnic_back_path} label="CNIC (back)" />
            <PhotoField path={s.passport_photo_path} label="Passport photo" />
            <PhotoField path={s.posts_photo_path} label="Posts photo" />
          </div>
        </DetailSection>

        <DetailSection icon={Phone} title="Contact information">
          <div className="onboarding-detail-grid">
            <EditableField label="Phone" value={s.phone} onSave={save("phone")} />
            <EditableField
              label="Father's / husband's phone"
              value={s.guardian_phone}
              onSave={save("guardian_phone")}
            />
            <EditableField label="Email" value={s.email} onSave={save("email")} />
            <EditableField
              label="Current address"
              value={s.current_address}
              onSave={save("current_address")}
            />
            <EditableField
              label="Permanent address"
              value={s.permanent_address}
              onSave={save("permanent_address")}
            />
            <EditableField
              label="Emergency contact name"
              value={s.emergency_contact_1_name}
              onSave={save("emergency_contact_1_name")}
            />
            <EditableField
              label="Emergency contact relationship"
              value={s.emergency_contact_1_relationship}
              onSave={save("emergency_contact_1_relationship")}
            />
            <EditableField
              label="Emergency contact phone"
              value={s.emergency_contact_1_phone}
              onSave={save("emergency_contact_1_phone")}
            />
            <EditableField
              label="Second emergency contact name"
              value={s.emergency_contact_2_name ?? ""}
              onSave={save("emergency_contact_2_name")}
            />
            <EditableField
              label="Second emergency contact relationship"
              value={s.emergency_contact_2_relationship ?? ""}
              onSave={save("emergency_contact_2_relationship")}
            />
            <EditableField
              label="Second emergency contact phone"
              value={s.emergency_contact_2_phone ?? ""}
              onSave={save("emergency_contact_2_phone")}
            />
          </div>
        </DetailSection>

        <DetailSection icon={Landmark} title="Payroll & tax">
          <div className="onboarding-detail-grid">
            <EditableField label="Bank name" value={s.bank_name} onSave={save("bank_name")} />
            <EditableField label="Branch" value={s.bank_branch} onSave={save("bank_branch")} />
            <EditableField
              label="Account title"
              value={s.account_title}
              onSave={save("account_title")}
            />
            <EditableField
              label="Account number"
              value={s.account_number}
              onSave={save("account_number")}
            />
            <EditableField label="IBAN" value={s.iban} onSave={save("iban")} />
            <EditableField
              label="FBR filer status"
              value={s.fbr_filer_status}
              onSave={save("fbr_filer_status")}
              options={fbrFilerOptions}
            />
          </div>
        </DetailSection>

        <DetailSection icon={ShieldCheck} title="Statutory & benefits">
          <div className="onboarding-detail-grid">
            <EditableField label="Nominee name" value={s.nominee_name} onSave={save("nominee_name")} />
            <EditableField
              label="Nominee relationship"
              value={s.nominee_relationship}
              onSave={save("nominee_relationship")}
            />
            <EditableField label="Nominee CNIC" value={s.nominee_cnic} onSave={save("nominee_cnic")} />
            <EditableField
              label="Blood group"
              value={s.blood_group}
              onSave={save("blood_group")}
              options={bloodGroupOptions}
            />
          </div>
        </DetailSection>

        <DetailSection icon={GraduationCap} title="Employment & education">
          <div className="onboarding-detail-documents">
            <DocumentLink path={s.offer_letter_path} label="Signed offer letter" />
            <DocumentLink path={s.university_proof_path} label="University proof" />
            {s.degree_certificate_paths.map((path, i) => (
              <DocumentLink key={path} path={path} label={`Degree certificate ${i + 1}`} />
            ))}
          </div>
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

  async function handleFieldSave(id: string, field: keyof OnboardingSubmission, value: string) {
    const { error } = await supabase
      .from("onboarding_submissions")
      .update({ [field]: value })
      .eq("id", id);
    if (error) throw error;
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  const counts = useMemo(
    () => ({
      all: submissions.length,
      pending: submissions.filter((s) => s.status === "pending").length,
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
        <span className="admin-empty-icon-circle">
          <Inbox size={22} />
        </span>
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
          <Inbox size={15} className="admin-stat-icon" />
          <span className="admin-stat-value">{counts.all}</span>
          <span className="admin-stat-label">All</span>
        </button>
        <button
          type="button"
          className={`admin-stat-tile admin-stat-tile-pending ${filter === "pending" ? "is-active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          <FileText size={15} className="admin-stat-icon" />
          <span className="admin-stat-value">{counts.pending}</span>
          <span className="admin-stat-label">Incomplete</span>
        </button>
        <button
          type="button"
          className={`admin-stat-tile admin-stat-tile-submitted ${filter === "submitted" ? "is-active" : ""}`}
          onClick={() => setFilter("submitted")}
        >
          <FileText size={15} className="admin-stat-icon" />
          <span className="admin-stat-value">{counts.submitted}</span>
          <span className="admin-stat-label">Submitted</span>
        </button>
        <button
          type="button"
          className={`admin-stat-tile admin-stat-tile-reviewed ${filter === "reviewed" ? "is-active" : ""}`}
          onClick={() => setFilter("reviewed")}
        >
          <CheckCircle2 size={15} className="admin-stat-icon" />
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
              <span className="admin-empty-icon-circle" style={{ width: 40, height: 40 }}>
                <Inbox size={18} />
              </span>
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
                  <span className={`badge ${STATUS_BADGE[s.status].className}`}>
                    {STATUS_BADGE[s.status].label}
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
              onFieldSave={handleFieldSave}
              onBack={() => setSelectedId(null)}
            />
          ) : (
            <div className="glass-card admin-detail-empty">
              <span className="admin-empty-icon-circle">
                <Inbox size={22} />
              </span>
              <p>Select a submission to view full details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
