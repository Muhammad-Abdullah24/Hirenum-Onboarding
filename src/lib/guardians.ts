export type Guardian = "father" | "relative" | "other";

export type GuardianOption = {
  value: Guardian;
  label: string;
};

export const guardianOptions: GuardianOption[] = [
  { value: "father", label: "Father" },
  { value: "relative", label: "Relative" },
  { value: "other", label: "Other" },
];

export const guardianLabel = (value: string) =>
  guardianOptions.find((g) => g.value === value)?.label ?? value;
