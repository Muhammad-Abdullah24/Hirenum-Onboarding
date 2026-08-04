"use client";

import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { Select } from "@/components/ui/Select";

type Option = { value: string; label: string };

export function EditableField({
  label,
  value,
  onSave,
  type = "text",
  options,
}: {
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  type?: "text" | "date";
  options?: Option[];
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit() {
    setDraft(value);
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError(null);
  }

  async function save() {
    if (draft === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(draft);
      setEditing(false);
    } catch (err) {
      console.error(err);
      setError("Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="admin-editable-field">
        <p className="detail-label">{label}</p>
        <div className="admin-editable-field-row">
          <p>{value || "–"}</p>
          <button
            type="button"
            className="admin-editable-field-edit"
            onClick={startEdit}
            aria-label={`Edit ${label}`}
          >
            <Pencil size={12} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-editable-field">
      <p className="detail-label">{label}</p>
      {options ? (
        <Select options={options} value={draft} onChange={setDraft} />
      ) : (
        <input
          type={type}
          className="field-input admin-editable-field-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
        />
      )}
      <div className="admin-editable-field-actions">
        <button
          type="button"
          className="admin-editable-field-save"
          onClick={save}
          disabled={saving}
          aria-label={`Save ${label}`}
        >
          <Check size={13} />
        </button>
        <button
          type="button"
          className="admin-editable-field-cancel"
          onClick={cancel}
          disabled={saving}
          aria-label={`Cancel editing ${label}`}
        >
          <X size={13} />
        </button>
      </div>
      {error && <p className="admin-editable-field-error">{error}</p>}
    </div>
  );
}
