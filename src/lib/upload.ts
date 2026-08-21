// Helpers shared by the two public upload forms (/apply and /onboarding).

export function newId(): string {
  // crypto.randomUUID() is only defined in a SECURE CONTEXT -- https, or
  // localhost. Opening the dev server from a phone on the same wifi
  // (http://192.168.x.x:3000) is NOT a secure context, so randomUUID is
  // undefined there and calling it throws a TypeError. In OnboardingForm
  // that happens on the very first line of the submit handler, before the
  // row insert and before any upload, so the whole thing dies with a
  // generic error and not one file leaves the browser -- which looks
  // exactly like "uploads are broken" while production over https is fine.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  // getRandomValues, unlike randomUUID and crypto.subtle, IS available over
  // plain http -- so this builds the same RFC 4122 v4 shape by hand.
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10x
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function fileExtension(file: File): string {
  const dot = file.name.lastIndexOf(".");
  if (dot > 0 && dot < file.name.length - 1) {
    return file.name.slice(dot + 1).toLowerCase();
  }
  // Plain `name.split(".").pop()` returns the WHOLE filename when there is
  // no dot -- which some Android camera captures do -- producing storage
  // paths like "cnic-front-<uuid>.IMG_20240101" and an admin download named
  // the same. Fall back to the MIME subtype ("image/jpeg" -> "jpeg").
  const subtype = file.type.split("/")[1];
  return subtype ? subtype.split(";")[0] : "bin";
}
