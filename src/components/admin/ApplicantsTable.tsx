"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Applicant, ApplicantStatus } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { guardianLabel } from "@/lib/guardians";

export function ApplicantsTable() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ApplicantStatus | "all">("all");

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

  const visible =
    filter === "all" ? applicants : applicants.filter((a) => a.status === filter);

  if (loading) {
    return <p style={{ color: "var(--text-secondary)" }}>Loading applicants...</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "applied", "shortlisted", "offer_sent", "completed", "rejected"] as const).map(
          (f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="btn btn-ghost"
              style={{
                padding: "0.4rem 1rem",
                fontSize: "12px",
                borderColor: filter === f ? "var(--accent)" : "var(--border-color)",
                color: filter === f ? "var(--accent)" : "var(--text-primary)",
              }}
            >
              <span>{f === "all" ? "All" : f.replace("_", " ")}</span>
            </button>
          )
        )}
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Guardian</th>
              <th className="text-left p-4">Contact</th>
              <th className="text-left p-4">CNIC</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((a) => (
              <tr key={a.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                <td className="p-4">{a.full_name}</td>
                <td className="p-4">{guardianLabel(a.guardian)}</td>
                <td className="p-4">
                  <div>{a.email}</div>
                  <div style={{ color: "var(--text-secondary)" }}>{a.phone}</div>
                </td>
                <td className="p-4">
                  {a.cnic_photo_url ? (
                    <a
                      href={a.cnic_photo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover-underline"
                      style={{ color: "var(--accent)" }}
                    >
                      View
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-4">
                  <StatusBadge status={a.status} />
                </td>
                <td className="p-4">
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
            {visible.length === 0 && (
              <tr>
                <td className="p-4" colSpan={6} style={{ color: "var(--text-secondary)" }}>
                  No applicants in this view yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
