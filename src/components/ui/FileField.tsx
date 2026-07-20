"use client";

type FileFieldProps = {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  multiple?: boolean;
  accept?: string;
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
  files,
  onChange,
}: FileFieldProps) {
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
        onChange={(e) => onChange(Array.from(e.target.files ?? []))}
      />
      {files.length > 0 && (
        <p className="file-field-selected">
          {files.map((f) => f.name).join(", ")}
        </p>
      )}
      {hint && !files.length && <p className="file-field-hint">{hint}</p>}
    </div>
  );
}
