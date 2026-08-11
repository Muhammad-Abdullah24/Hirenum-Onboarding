import { Check } from "lucide-react";

export type StepInfo = {
  label: string;
  complete: boolean;
};

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  disabled = false,
}: {
  steps: StepInfo[];
  currentStep: number;
  onStepClick: (index: number) => void;
  disabled?: boolean;
}) {
  const completedCount = steps.filter((s) => s.complete).length;
  const percent = Math.round((completedCount / steps.length) * 100);

  return (
    <nav className="stepper" aria-label="Onboarding steps">
      <div className="stepper-progress-row">
        <p className="stepper-current-label">
          Step {currentStep + 1} of {steps.length} &middot; {steps[currentStep].label}
        </p>
        <span className="stepper-progress-percent">{percent}% complete</span>
      </div>
      <div
        className="stepper-progress-bar"
        role="progressbar"
        aria-label="Onboarding progress"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="stepper-progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <ol className="stepper-list">
        {steps.map((s, i) => (
          <li className="stepper-item" key={s.label}>
            <button
              type="button"
              className={`stepper-node ${i === currentStep ? "is-current" : ""} ${
                s.complete ? "is-complete" : ""
              }`}
              onClick={() => onStepClick(i)}
              aria-current={i === currentStep ? "step" : undefined}
              disabled={disabled}
            >
              <span className="stepper-node-icon">
                {s.complete ? <Check size={13} /> : i + 1}
              </span>
              <span className="stepper-node-label">{s.label}</span>
            </button>
            {i < steps.length - 1 && (
              <span
                className={`stepper-connector ${s.complete ? "is-filled" : ""}`}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
