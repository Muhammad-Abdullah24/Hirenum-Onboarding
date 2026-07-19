export type ApplicantStatus =
  | "applied"
  | "shortlisted"
  | "offer_sent"
  | "completed"
  | "rejected";

export interface Applicant {
  id: string;
  created_at: string;
  full_name: string;
  phone: string;
  email: string;
  guardian: string;
  cnic_photo_url: string | null;
  cnic_number: string | null;
  status: ApplicantStatus;
  stipend: number | null;
  contract_period: string | null;
  notes: string | null;
}
