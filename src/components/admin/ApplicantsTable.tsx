"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ExternalLink, Users } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Applicant, ApplicantStatus } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdminAvatar } from "@/components/admin/AdminAvatar";
import { guardianLabel } from "@/lib/guardians";

const statusOrder: ApplicantStatus[] = [
  "applied",
  "shortlisted",
  "offer_sent",
  "completed",
  "rejected",
];

const statusLabels: Record<ApplicantStatus, string> = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  offer_sent: "Offer sent",
  completed: "Completed",
  rejected: "Not selected",
};

export function ApplicantsTable() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ApplicantStatus | "all">("all");
  const [query, setQuery] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("applicants")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setApplicants(data as Applicant[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: ApplicantStatus) {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    // This is the row-level hook n8n will eventually watch (via a Supabase
    // database webhook on UPDATE) to trigger the email to Bin Aslam once
    // status flips to "shortlisted".
    await supabase.from("applicants").update({ status }).eq("id", id);
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: applicants.length };
    for (const s of statusOrder) c[s] = 0;
    for (const a of applicants) c[a.status] = (c[a.status] ?? 0) + 1;
    return c;
  }, [applicants]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applicants.filter((a) => {
      if (filter !== "all" && a.status !== filter) return false;
      if (!q) return true;
      return (
        a.full_name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q)
      );
    });
  }, [applicants, filter, query]);

  if (loading) {
    return (
      <div className="admin-skeleton-list">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="admin-skeleton-row" />
        ))}
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
        {statusOrder.map((s) => (
          <button
            key={s}
            type="button"
            className={`admin-stat-tile admin-stat-tile-${s} ${filter === s ? "is-active" : ""}`}
            onClick={() => setFilter(s)}
          >
            <span className="admin-stat-value">{counts[s] ?? 0}</span>
            <span className="admin-stat-label">{statusLabels[s]}</span>
          </button>
        ))}
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={15} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="admin-search-input"
          />
        </div>
        <p className="admin-toolbar-count">
          {visible.length} of {applicants.length}
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="admin-empty">
          <Users size={28} className="admin-empty-icon" />
          <p>No applicants match this view.</p>
        </div>
      ) : (
        <>
          <div className="glass-card admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Guardian</th>
                  <th>Contact</th>
                  <th>CNIC</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="admin-table-name-cell">
                        <AdminAvatar name={a.full_name} />
                        <div>
                          <p className="admin-table-name">{a.full_name}</p>
                          <p className="admin-table-subtle">
                            {new Date(a.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>{guardianLabel(a.guardian)}</td>
                    <td>
                      <div>{a.email}</div>
                      <div className="admin-table-subtle">{a.phone}</div>
                    </td>
                    <td>
                      {a.cnic_photo_url ? (
                        <a
                          href={a.cnic_photo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-doc-link"
                        >
                          View <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="admin-table-subtle">—</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                    <td>
                      {a.status === "applied" && (
                        <button
                          className="btn btn-primary"
                          style={{ padding: "0.4rem 1rem", fontSize: "12px" }}
                          onClick={() => updateStatus(a.id, "shortlisted")}
                        >
                          <span>Shortlist</span>
                        </button>
                      )}
                      {a.status === "shortlisted" && (
                        <button
                          className="btn btn-ghost"
                          style={{ padding: "0.4rem 1rem", fontSize: "12px" }}
                          onClick={() => updateStatus(a.id, "rejected")}
                        >
                          <span>Reject</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-card-list">
            {visible.map((a) => (
              <div key={a.id} className="glass-card admin-applicant-card">
                <div className="admin-table-name-cell">
                  <AdminAvatar name={a.full_name} />
                  <div>
                    <p className="admin-table-name">{a.full_name}</p>
                    <p className="admin-table-subtle">
                      {new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                <div className="admin-applicant-card-grid">
                  <div>
                    <p className="detail-label">Guardian</p>
                    <p>{guardianLabel(a.guardian)}</p>
                  </div>
                  <div>
                    <p className="detail-label">Contact</p>
                    <p>{a.email}</p>
                    <p className="admin-table-subtle">{a.phone}</p>
                  </div>
                  <div>
                    <p className="detail-label">CNIC</p>
                    {a.cnic_photo_url ? (
                      <a
                        href={a.cnic_photo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-doc-link"
                      >
                        View <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="admin-table-subtle">—</span>
                    )}
                  </div>
                </div>
                {(a.status === "applied" || a.status === "shortlisted") && (
                  <div className="admin-applicant-card-actions">
                    {a.status === "applied" && (
                      <button
                        className="btn btn-primary"
                        style={{ padding: "0.4rem 1rem", fontSize: "12px" }}
                        onClick={() => updateStatus(a.id, "shortlisted")}
                      >
                        <span>Shortlist</span>
                      </button>
                    )}
                    {a.status === "shortlisted" && (
                      <button
                        className="btn btn-ghost"
                        style={{ padding: "0.4rem 1rem", fontSize: "12px" }}
                        onClick={() => updateStatus(a.id, "rejected")}
                      >
                        <span>Reject</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
