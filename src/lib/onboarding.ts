export const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const maritalStatusOptions = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
];

export const fbrFilerOptions = [
  { value: "filer", label: "Filer" },
  { value: "non_filer", label: "Non-filer" },
  { value: "not_sure", label: "Not sure" },
];

export const bloodGroupOptions = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
  { value: "unknown", label: "Not sure" },
];

export type OnboardingStatus = "submitted" | "reviewed";

export interface OnboardingSubmission {
  id: string;
  created_at: string;
  status: OnboardingStatus;

  full_name: string;
  guardian_name: string;
  cnic_number: string;
  cnic_front_path: string;
  cnic_back_path: string;
  date_of_birth: string;
  gender: string;
  marital_status: string;
  nationality: string;
  passport_photo_path: string;
  posts_photo_path: string | null;

  phone: string;
  guardian_phone: string;
  email: string;
  current_address: string;
  permanent_address: string;
  emergency_contact_1_name: string;
  emergency_contact_1_relationship: string;
  emergency_contact_1_phone: string;
  emergency_contact_2_name: string | null;
  emergency_contact_2_relationship: string | null;
  emergency_contact_2_phone: string | null;

  bank_name: string;
  bank_branch: string;
  account_title: string;
  account_number: string;
  iban: string;
  fbr_filer_status: string;

  nominee_name: string;
  nominee_cnic: string;
  nominee_relationship: string;
  blood_group: string;

  offer_letter_path: string;
  university_proof_path: string;
  degree_certificate_paths: string[];

  notes: string | null;
}
