import { Check } from "lucide-react";

export function FormSection({
  index,
  title,
  description,
  complete,
  children,
}: {
  index: number;
  title: string;
  description?: string;
  complete: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`glass-card form-section ${complete ? "is-complete" : ""}`}>
      <div className="form-section-header">
        <div className="form-section-badge">
          {complete ? <Check size={14} /> : index}
        </div>
        <div>
          <h2 className="form-section-title">{title}</h2>
          {description && (
            <p className="form-section-description">{description}</p>
          )}
        </div>
      </div>
      <div className="form-section-body">{children}</div>
    </div>
  );
}
