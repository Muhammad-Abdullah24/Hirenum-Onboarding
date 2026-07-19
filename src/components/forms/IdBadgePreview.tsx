"use client";

import { useEffect, useState } from "react";
import { Check, User } from "lucide-react";

export type BadgeSection = {
  label: string;
  complete: boolean;
};

export function IdBadgePreview({
  fullName,
  photoFile,
  nationality,
  sections,
  allComplete,
}: {
  fullName: string;
  photoFile: File | null;
  nationality: string;
  sections: BadgeSection[];
  allComplete: boolean;
}) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!photoFile) {
      setPhotoUrl(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  return (
    <div className={`id-badge ${allComplete ? "is-sealed" : ""}`}>
      <div className="id-badge-topbar" />
      <div className="id-badge-body">
        <div className="id-badge-photo">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" />
          ) : (
            <User size={28} className="id-badge-photo-placeholder" />
          )}
        </div>

        <p className="id-badge-name">{fullName || "Your name here"}</p>
        <p className="id-badge-sub">
          {nationality || "Hirenum team member"}
        </p>

        <div className="id-badge-divider" />

        <ul className="id-badge-checklist">
          {sections.map((s) => (
            <li key={s.label} className={s.complete ? "is-complete" : ""}>
              <span className="id-badge-checklist-icon">
                {s.complete && <Check size={11} />}
              </span>
              {s.label}
            </li>
          ))}
        </ul>
      </div>

      {allComplete && (
        <div className="id-badge-seal">
          <span>Welcome aboard</span>
        </div>
      )}
    </div>
  );
}
