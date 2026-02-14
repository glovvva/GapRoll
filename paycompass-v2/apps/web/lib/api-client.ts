import { createClient } from "./supabase/client";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = {
    "Content-Type": "application/json",
    ...(session?.access_token && {
      Authorization: `Bearer ${session.access_token}`,
    }),
    ...options.headers,
  } as HeadersInit;

  return fetch(url, {
    ...options,
    headers,
  });
}
