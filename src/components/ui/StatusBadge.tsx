import { ApplicantStatus } from "@/lib/types";

const labels: Record<ApplicantStatus, string> = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  offer_sent: "Offer sent",
  completed: "Completed",
  rejected: "Not selected",
};

export function StatusBadge({ status }: { status: ApplicantStatus }) {
  return <span className={`badge badge-${status}`}>{labels[status]}</span>;
}
