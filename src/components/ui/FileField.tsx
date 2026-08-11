"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle2, FileText, X } from "lucide-react";

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

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
  const [isDragOver, setIsDragOver] = useState(false);

  function acceptSelection(selected: File[]) {
    const maxBytes = maxSizeMB * 1024 * 1024;
    const accepted = selected.filter((f) => f.size <= maxBytes);
    const tooLarge = selected.filter((f) => f.size > maxBytes).map((f) => f.name);
    setRejected(tooLarge);
    onChange(multiple ? [...files, ...accepted] : accepted.slice(0, 1));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    acceptSelection(Array.from(e.target.files ?? []));
    // Reset so re-selecting the same file (e.g. after removing it) still fires onChange.
    e.target.value = "";
  }

  function removeFile(index: number) {
    setRejected([]);
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
        {required && (
          <span className="required-mark" aria-hidden="true">*</span>
        )}
      </label>

      <div
        className={`dropzone ${isDragOver ? "is-dragover" : ""} ${files.length ? "has-files" : ""} ${
          rejected.length ? "has-error" : ""
        }`}
      >
        <input
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          required={required && files.length === 0}
          className="dropzone-input"
          onChange={handleChange}
          onDragEnter={() => setIsDragOver(true)}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={() => setIsDragOver(false)}
        />
        <div className="dropzone-visual">
          <span className="dropzone-icon-circle" aria-hidden="true">
            {files.length ? <CheckCircle2 size={17} /> : <UploadCloud size={17} />}
          </span>
          <span className="dropzone-copy">
            <span className="dropzone-title">
              {files.length
                ? `${files.length} file${files.length > 1 ? "s" : ""} attached — click or drop to ${multiple ? "add more" : "replace"}`
                : "Drop a file here or click to browse"}
            </span>
            {hint && <span className="dropzone-hint">{hint}</span>}
          </span>
        </div>
      </div>

      {files.length > 0 && (
        <ul className="dropzone-files">
          {files.map((f, i) => (
            <li className="dropzone-file-chip" key={`${f.name}-${f.size}-${i}`}>
              <FileText size={13} aria-hidden="true" />
              <span className="dropzone-file-name">{f.name}</span>
              <span className="dropzone-file-size">{formatSize(f.size)}</span>
              <button
                type="button"
                className="dropzone-file-remove"
                onClick={() => removeFile(i)}
                aria-label={`Remove ${f.name}`}
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {rejected.length > 0 && (
        <p className="text-sm" style={{ color: "#e24b4a" }}>
          {rejected.join(", ")} {rejected.length === 1 ? "is" : "are"} over the {maxSizeMB}MB
          limit and {rejected.length === 1 ? "wasn't" : "weren't"} attached. Try a smaller file.
        </p>
      )}
    </div>
  );
}
