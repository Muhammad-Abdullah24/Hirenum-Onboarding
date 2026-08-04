"use client";

import { useState } from "react";

type FileFieldProps = {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  multiple?: boolean;
  accept?: string;
  maxSizeMB?: number;
  files: File[];
  onChange: (files: File[]) => void;
};

export function FileField({
  id,
  label,
  hint,
  required = false,
  multiple = false,
  accept = "image/*,application/pdf",
  maxSizeMB = 20,
  files,
  onChange,
}: FileFieldProps) {
  const [rejected, setRejected] = useState<string[]>([]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const maxBytes = maxSizeMB * 1024 * 1024;
    const accepted = selected.filter((f) => f.size <= maxBytes);
    const tooLarge = selected.filter((f) => f.size > maxBytes).map((f) => f.name);
    setRejected(tooLarge);
    onChange(accepted);
  }

  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
        {required && (
          <span className="required-mark" aria-hidden="true">*</span>
        )}
      </label>
      <input
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        required={required && files.length === 0}
        className="field-input"
        onChange={handleChange}
      />
      {files.length > 0 && (
        <p className="file-field-selected">
          {files.map((f) => f.name).join(", ")}
        </p>
      )}
      {rejected.length > 0 && (
        <p className="text-sm" style={{ color: "#e24b4a" }}>
          {rejected.join(", ")} {rejected.length === 1 ? "is" : "are"} over the {maxSizeMB}MB
          limit and {rejected.length === 1 ? "wasn't" : "weren't"} attached. Try a smaller file.
        </p>
      )}
      {hint && !files.length && <p className="file-field-hint">{hint}</p>}
    </div>
  );
}
