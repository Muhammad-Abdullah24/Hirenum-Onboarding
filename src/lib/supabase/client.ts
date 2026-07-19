import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Surfaces a clear error in dev instead of a cryptic fetch failure.
  console.warn(
    "Supabase env vars are missing. Copy .env.example to .env.local and fill them in."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
