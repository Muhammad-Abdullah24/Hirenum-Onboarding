"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Select } from "@/components/ui/Select";
import { FileField } from "@/components/ui/FileField";
import { FormSection } from "@/components/forms/FormSection";
import { IdBadgePreview } from "@/components/forms/IdBadgePreview";
import {
  genderOptions,
  maritalStatusOptions,
  fbrFilerOptions,
  bloodGroupOptions,
} from "@/lib/onboarding";

const DRAFT_KEY = "hirenum-onboarding-draft";
// Generous per-file ceiling for a slow mobile connection: bounds the worst
// case instead of leaving an upload hanging with no feedback forever.
const UPLOAD_TIMEOUT_MS = 60_000;

type TextFieldName =
  | "fullName"
  | "guardianName"
  | "cnicNumber"
  | "dateOfBirth"
  | "gender"
  | "maritalStatus"
  | "nationality"
  | "phone"
  | "guardianPhone"
  | "email"
  | "currentAddress"
  | "permanentAddress"
  | "ec1Name"
  | "ec1Relationship"
  | "ec1Phone"
  | "ec2Name"
  | "ec2Relationship"
  | "ec2Phone"
  | "bankName"
  | "bankBranch"
  | "accountTitle"
  | "accountNumber"
  | "iban"
  | "fbrFilerStatus"
  | "nomineeName"
  | "nomineeCnic"
  | "nomineeRelationship"
  | "bloodGroup";

const emptyValues: Record<TextFieldName, string> = {
  fullName: "",
  guardianName: "",
  cnicNumber: "",
  dateOfBirth: "",
  gender: "",
  maritalStatus: "",
  nationality: "",
  phone: "",
  guardianPhone: "",
  email: "",
  currentAddress: "",
  permanentAddress: "",
  ec1Name: "",
  ec1Relationship: "",
  ec1Phone: "",
  ec2Name: "",
  ec2Relationship: "",
  ec2Phone: "",
  bankName: "",
  bankBranch: "",
  accountTitle: "",
  accountNumber: "",
  iban: "",
  fbrFilerStatus: "",
  nomineeName: "",
  nomineeCnic: "",
  nomineeRelationship: "",
  bloodGroup: "",
};

export function OnboardingForm() {
  const router = useRouter();
  const [values, setValues] = useState(emptyValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  // Reused across retries so a failed attempt updates the same Supabase row
  // instead of leaving an orphaned one behind.
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const [cnicFront, setCnicFront] = useState<File[]>([]);
  const [cnicBack, setCnicBack] = useState<File[]>([]);
  const [passportPhoto, setPassportPhoto] = useState<File[]>([]);
  const [postsPhoto, setPostsPhoto] = useState<File[]>([]);
  const [offerLetter, setOfferLetter] = useState<File[]>([]);
  const [universityProof, setUniversityProof] = useState<File[]>([]);
  const [degreeCertificates, setDegreeCertificates] = useState<File[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      setValues((v) => ({ ...v, ...parsed.values }));
      if (parsed.submissionId) setSubmissionId(parsed.submissionId);
    } catch {
      // ignore corrupt draft
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ values, submissionId }));
  }, [values, submissionId]);

  function text(name: TextFieldName) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [name]: e.target.value }));
  }

  function select(name: TextFieldName) {
    return (value: string) => setValues((v) => ({ ...v, [name]: value }));
  }

  const identityComplete = Boolean(
    values.fullName &&
      values.guardianName &&
      values.cnicNumber &&
      cnicFront.length &&
      cnicBack.length &&
      values.dateOfBirth &&
      values.gender &&
      values.maritalStatus &&
      values.nationality &&
      passportPhoto.length
  );

  const contactComplete = Boolean(
    values.phone &&
      values.guardianPhone &&
      values.email &&
      values.currentAddress &&
      values.permanentAddress &&
      values.ec1Name &&
      values.ec1Relationship &&
      values.ec1Phone
  );

  const payrollComplete = Boolean(
    values.bankName &&
      values.bankBranch &&
      values.accountTitle &&
      values.accountNumber &&
      values.iban &&
      values.fbrFilerStatus
  );

  const statutoryComplete = Boolean(
    values.nomineeName && values.nomineeCnic && values.nomineeRelationship && values.bloodGroup
  );

  const employmentComplete = Boolean(offerLetter.length && universityProof.length);

  const allComplete =
    identityComplete &&
    contactComplete &&
    payrollComplete &&
    statutoryComplete &&
    employmentComplete;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!allComplete) {
      setError("Please fill in every required field and document before submitting.");
      return;
    }

    setLoading(true);
    setUploadStatus(null);

    // Reuse the id from a previous failed attempt (restored from the draft)
    // so a retry updates that same row instead of leaving it orphaned as a
    // second untouched 'pending' row.
    const id = submissionId ?? crypto.randomUUID();
    if (!submissionId) setSubmissionId(id);

    try {
      // Write the row *before* touching any file uploads. This is the key
      // change: a submission attempt now shows up in Supabase the instant
      // it starts, even if the uploads below stall or the browser kills the
      // tab mid-upload (the scenario that let a real attempt vanish with no
      // trace at all). upsert() makes this safe to repeat on retry.
      const { error: upsertError } = await supabase.from("onboarding_submissions").upsert({
        id,
        status: "pending",
        full_name: values.fullName,
        guardian_name: values.guardianName,
        cnic_number: values.cnicNumber,
        date_of_birth: values.dateOfBirth,
        gender: values.gender,
        marital_status: values.maritalStatus,
        nationality: values.nationality,

        phone: values.phone,
        guardian_phone: values.guardianPhone,
        email: values.email,
        current_address: values.currentAddress,
        permanent_address: values.permanentAddress,
        emergency_contact_1_name: values.ec1Name,
        emergency_contact_1_relationship: values.ec1Relationship,
        emergency_contact_1_phone: values.ec1Phone,
        emergency_contact_2_name: values.ec2Name || null,
        emergency_contact_2_relationship: values.ec2Relationship || null,
        emergency_contact_2_phone: values.ec2Phone || null,

        bank_name: values.bankName,
        bank_branch: values.bankBranch,
        account_title: values.accountTitle,
        account_number: values.accountNumber,
        iban: values.iban,
        fbr_filer_status: values.fbrFilerStatus,

        nominee_name: values.nomineeName,
        nominee_cnic: values.nomineeCnic,
        nominee_relationship: values.nomineeRelationship,
        blood_group: values.bloodGroup,
      });

      if (upsertError) throw upsertError;

      async function uploadOne(file: File, name: string) {
        const ext = file.name.split(".").pop();
        const path = `${id}/${name}.${ext}`;
        // supabase-js's storage upload() has no abort/signal option, so this
        // can't cancel the underlying request -- but it stops the UI from
        // waiting on it forever and lets the user retry instead of being
        // stuck on a stalled connection with no feedback.
        let timeoutId: ReturnType<typeof setTimeout>;
        const timeout = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(
            () => reject(new Error(`Uploading "${file.name}" timed out. Check your connection and try again.`)),
            UPLOAD_TIMEOUT_MS
          );
        });
        const upload = supabase.storage
          .from("onboarding-documents")
          // upsert: true -- a retry may re-upload a file that already made
          // it up in a previous partial attempt.
          .upload(path, file, { upsert: true })
          .then(({ error: uploadError }) => {
            if (uploadError) throw uploadError;
            return path;
          });
        try {
          return await Promise.race([upload, timeout]);
        } finally {
          clearTimeout(timeoutId!);
        }
      }

      // Sequential, not Promise.all: keeps a weak mobile connection from
      // having to sustain 6-7 simultaneous uploads at once, and lets the
      // button show real per-file progress instead of an indefinite spinner.
      const queue: { file: File; name: string }[] = [
        { file: cnicFront[0], name: "cnic-front" },
        { file: cnicBack[0], name: "cnic-back" },
        { file: passportPhoto[0], name: "passport-photo" },
        ...(postsPhoto[0] ? [{ file: postsPhoto[0], name: "posts-photo" }] : []),
        { file: offerLetter[0], name: "offer-letter" },
        { file: universityProof[0], name: "university-proof" },
        ...degreeCertificates.map((file, i) => ({ file, name: `degree-${i}` })),
      ];

      const paths: Record<string, string> = {};
      for (let i = 0; i < queue.length; i++) {
        const { file, name } = queue[i];
        setUploadStatus(`Uploading ${i + 1} of ${queue.length}: ${file.name}`);
        paths[name] = await uploadOne(file, name);
      }

      const { error: updateError } = await supabase
        .from("onboarding_submissions")
        .update({
          status: "submitted",
          cnic_front_path: paths["cnic-front"],
          cnic_back_path: paths["cnic-back"],
          passport_photo_path: paths["passport-photo"],
          posts_photo_path: paths["posts-photo"] ?? null,
          offer_letter_path: paths["offer-letter"],
          university_proof_path: paths["university-proof"],
          degree_certificate_paths: degreeCertificates.map((_, i) => paths[`degree-${i}`]),
        })
        .eq("id", id);

      if (updateError) throw updateError;

      localStorage.removeItem(DRAFT_KEY);
      router.push("/onboarding/success");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error && err.message.includes("timed out")
          ? err.message
          : "Something went wrong submitting your paperwork. Your progress was saved — please try again."
      );
    } finally {
      setLoading(false);
      setUploadStatus(null);
    }
  }

  const badgeSections = [
    { label: "Identity & personal details", complete: identityComplete },
    { label: "Contact information", complete: contactComplete },
    { label: "Payroll & tax", complete: payrollComplete },
    { label: "Statutory & benefits", complete: statutoryComplete },
    { label: "Employment & education", complete: employmentComplete },
  ];

  const completedCount = badgeSections.filter((s) => s.complete).length;

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
      <div className={`onboarding-progress ${completedCount > 0 ? "has-progress" : ""}`}>
        <div className="onboarding-progress-track">
          <div
            className="onboarding-progress-fill"
            style={{ width: `${(completedCount / badgeSections.length) * 100}%` }}
          />
        </div>
        <p className="onboarding-progress-label">
          {completedCount} of {badgeSections.length} sections complete
        </p>
      </div>

      <div className="space-y-6">
        <p className="required-legend">
          <span className="required-mark" aria-hidden="true">*</span>
          Required field
        </p>

        <FormSection
          index={1}
          title="Identity & personal details"
          description="As they appear on your CNIC."
          complete={identityComplete}
        >
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="field-label" htmlFor="fullName">Full name<span className="required-mark" aria-hidden="true">*</span></label>
                <input id="fullName" className="field-input" required value={values.fullName} onChange={text("fullName")} placeholder="Your full name" />
              </div>
              <div>
                <label className="field-label" htmlFor="guardianName">Father&apos;s / husband&apos;s name<span className="required-mark" aria-hidden="true">*</span></label>
                <input id="guardianName" className="field-input" required value={values.guardianName} onChange={text("guardianName")} placeholder="As on CNIC" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="field-label" htmlFor="cnicNumber">CNIC number<span className="required-mark" aria-hidden="true">*</span></label>
                <input id="cnicNumber" className="field-input" required value={values.cnicNumber} onChange={text("cnicNumber")} placeholder="xxxxx-xxxxxxx-x" />
              </div>
              <div>
                <label className="field-label" htmlFor="dateOfBirth">Date of birth<span className="required-mark" aria-hidden="true">*</span></label>
                <input id="dateOfBirth" type="date" className="field-input" required value={values.dateOfBirth} onChange={text("dateOfBirth")} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FileField id="cnicFront" label="CNIC photo (front)" required files={cnicFront} onChange={setCnicFront} />
              <FileField id="cnicBack" label="CNIC photo (back)" required files={cnicBack} onChange={setCnicBack} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="field-label" htmlFor="gender">Gender<span className="required-mark" aria-hidden="true">*</span></label>
                <Select id="gender" options={genderOptions} value={values.gender} onChange={select("gender")} placeholder="Select gender" />
              </div>
              <div>
                <label className="field-label" htmlFor="maritalStatus">Marital status<span className="required-mark" aria-hidden="true">*</span></label>
                <Select id="maritalStatus" options={maritalStatusOptions} value={values.maritalStatus} onChange={select("maritalStatus")} placeholder="Select status" />
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="nationality">Nationality<span className="required-mark" aria-hidden="true">*</span></label>
              <input id="nationality" className="field-input" required value={values.nationality} onChange={text("nationality")} placeholder="e.g. Pakistani" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FileField id="passportPhoto" label="Passport-size photograph" required files={passportPhoto} onChange={setPassportPhoto} />
              <FileField id="postsPhoto" label="Photo for team / announcement posts" hint="Optional" files={postsPhoto} onChange={setPostsPhoto} />
            </div>
          </div>
        </FormSection>

        <FormSection
          index={2}
          title="Contact information"
          description="Used to reach you and, if needed, your family in an emergency."
          complete={contactComplete}
        >
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="field-label" htmlFor="phone">Personal mobile number<span className="required-mark" aria-hidden="true">*</span></label>
                <input id="phone" className="field-input" required value={values.phone} onChange={text("phone")} placeholder="03xx-xxxxxxx" />
              </div>
              <div>
                <label className="field-label" htmlFor="guardianPhone">Father&apos;s / husband&apos;s phone number<span className="required-mark" aria-hidden="true">*</span></label>
                <input id="guardianPhone" className="field-input" required value={values.guardianPhone} onChange={text("guardianPhone")} placeholder="03xx-xxxxxxx" />
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="email">Personal email<span className="required-mark" aria-hidden="true">*</span></label>
              <input id="email" type="email" className="field-input" required value={values.email} onChange={text("email")} placeholder="you@example.com" />
            </div>

            <div>
              <label className="field-label" htmlFor="currentAddress">Current residential address<span className="required-mark" aria-hidden="true">*</span></label>
              <textarea id="currentAddress" className="field-input" required rows={2} value={values.currentAddress} onChange={text("currentAddress")} placeholder="House, street, city" />
            </div>

            <div>
              <label className="field-label" htmlFor="permanentAddress">Permanent address<span className="required-mark" aria-hidden="true">*</span></label>
              <textarea id="permanentAddress" className="field-input" required rows={2} value={values.permanentAddress} onChange={text("permanentAddress")} placeholder="Often different from current address" />
            </div>

            <div>
              <p className="field-label" style={{ marginBottom: "10px" }}>Emergency contact<span className="required-mark" aria-hidden="true">*</span></p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <input className="field-input" required aria-label="Emergency contact name" value={values.ec1Name} onChange={text("ec1Name")} placeholder="Name" />
                <input className="field-input" required aria-label="Emergency contact relationship" value={values.ec1Relationship} onChange={text("ec1Relationship")} placeholder="Relationship" />
                <input className="field-input" required aria-label="Emergency contact phone" value={values.ec1Phone} onChange={text("ec1Phone")} placeholder="Phone number" />
              </div>
            </div>

            <div>
              <p className="field-label" style={{ marginBottom: "10px" }}>Second emergency contact <span style={{ fontWeight: 400 }}>(optional)</span></p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <input className="field-input" aria-label="Second emergency contact name" value={values.ec2Name} onChange={text("ec2Name")} placeholder="Name" />
                <input className="field-input" aria-label="Second emergency contact relationship" value={values.ec2Relationship} onChange={text("ec2Relationship")} placeholder="Relationship" />
                <input className="field-input" aria-label="Second emergency contact phone" value={values.ec2Phone} onChange={text("ec2Phone")} placeholder="Phone number" />
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection
          index={3}
          title="Payroll & tax"
          description="Used only for salary disbursement and tax filing. Never shared outside HR/finance."
          complete={payrollComplete}
        >
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="field-label" htmlFor="bankName">Bank name<span className="required-mark" aria-hidden="true">*</span></label>
                <input id="bankName" className="field-input" required value={values.bankName} onChange={text("bankName")} placeholder="e.g. Meezan Bank" />
              </div>
              <div>
                <label className="field-label" htmlFor="bankBranch">Branch<span className="required-mark" aria-hidden="true">*</span></label>
                <input id="bankBranch" className="field-input" required value={values.bankBranch} onChange={text("bankBranch")} placeholder="Branch name / code" />
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="accountTitle">Account title<span className="required-mark" aria-hidden="true">*</span></label>
              <input id="accountTitle" className="field-input" required value={values.accountTitle} onChange={text("accountTitle")} placeholder="Name on the account" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="field-label" htmlFor="accountNumber">Account number<span className="required-mark" aria-hidden="true">*</span></label>
                <input id="accountNumber" className="field-input" required value={values.accountNumber} onChange={text("accountNumber")} placeholder="Bank account number" />
              </div>
              <div>
                <label className="field-label" htmlFor="iban">IBAN<span className="required-mark" aria-hidden="true">*</span></label>
                <input id="iban" className="field-input" required value={values.iban} onChange={text("iban")} placeholder="PKxx xxxx xxxx xxxx xxxx xxxx" />
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="fbrFilerStatus">FBR filer status<span className="required-mark" aria-hidden="true">*</span></label>
              <Select id="fbrFilerStatus" options={fbrFilerOptions} value={values.fbrFilerStatus} onChange={select("fbrFilerStatus")} placeholder="Select status" />
            </div>
          </div>
        </FormSection>

        <FormSection
          index={4}
          title="Statutory & benefits"
          description="Nominee for PF balance, ESU value, and final dues in case of death."
          complete={statutoryComplete}
        >
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="field-label" htmlFor="nomineeName">Nominee name<span className="required-mark" aria-hidden="true">*</span></label>
                <input id="nomineeName" className="field-input" required value={values.nomineeName} onChange={text("nomineeName")} placeholder="Full name" />
              </div>
              <div>
                <label className="field-label" htmlFor="nomineeCnic">Nominee CNIC<span className="required-mark" aria-hidden="true">*</span></label>
                <input id="nomineeCnic" className="field-input" required value={values.nomineeCnic} onChange={text("nomineeCnic")} placeholder="xxxxx-xxxxxxx-x" />
              </div>
              <div>
                <label className="field-label" htmlFor="nomineeRelationship">Relationship<span className="required-mark" aria-hidden="true">*</span></label>
                <input id="nomineeRelationship" className="field-input" required value={values.nomineeRelationship} onChange={text("nomineeRelationship")} placeholder="e.g. Spouse" />
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="bloodGroup">Blood group<span className="required-mark" aria-hidden="true">*</span></label>
              <Select id="bloodGroup" options={bloodGroupOptions} value={values.bloodGroup} onChange={select("bloodGroup")} placeholder="Select blood group" />
            </div>
          </div>
        </FormSection>

        <FormSection
          index={5}
          title="Employment & education"
          description="Confirms your offer and education history for HR's records."
          complete={employmentComplete}
        >
          <div className="space-y-5">
            <FileField id="offerLetter" label="Signed offer letter" required files={offerLetter} onChange={setOfferLetter} />
            <FileField id="universityProof" label="Proof of your stated university" hint="Any document confirming you attended the university you named" required files={universityProof} onChange={setUniversityProof} />
            <FileField id="degreeCertificates" label="Educational certificates / degrees" hint="Optional" multiple files={degreeCertificates} onChange={setDegreeCertificates} />
          </div>
        </FormSection>

        {error && (
          <p className="text-sm" style={{ color: "#e24b4a" }}>
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          <span>
            {loading ? uploadStatus ?? "Submitting..." : "Submit onboarding paperwork"}
          </span>
        </button>
      </div>

      <div className="onboarding-badge-rail">
        <IdBadgePreview
          fullName={values.fullName}
          photoFile={passportPhoto[0] ?? null}
          nationality={values.nationality}
          sections={badgeSections}
          allComplete={allComplete}
        />
      </div>
    </form>
  );
}
