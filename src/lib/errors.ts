// Both public forms used to catch every failure and show the same fixed
// "something went wrong, please try again" string. That made a permanent,
// non-retryable misconfiguration (a missing storage bucket) look exactly
// like a flaky connection, so submitters kept retrying a form that could
// never succeed and no one could tell what was actually broken.
//
// This pulls the real message out of whatever Supabase threw so it can be
// shown alongside the friendly line. The shapes differ by client:
//   PostgrestError -> { message, code, details, hint }
//   StorageError   -> { message, statusCode, error }
// and a thrown Error/string is possible too.
export function errorDetail(err: unknown): string {
  if (typeof err === "string") return err;

  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    const message = typeof e.message === "string" ? e.message : null;
    // Postgres SQLSTATE ("42501" = insufficient privilege / RLS refusal) or
    // storage's string code ("NoSuchBucket"). Worth showing: it's the part
    // that makes the difference between "retry" and "fix your config".
    const code = typeof e.code === "string" ? e.code : null;

    if (message && code) return `${message} (${code})`;
    if (message) return message;
  }

  return "Unknown error";
}
