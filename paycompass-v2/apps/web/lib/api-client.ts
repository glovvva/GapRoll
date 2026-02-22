import { createClient } from "@/lib/supabase/client";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const supabase = createClient();

  // getUser() forces server validation and properly reads SSR cookies
  // getSession() may return null with cookie-based storage in dev
  let accessToken: string | null = null;

  // First try getSession (fast, no network)
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    accessToken = session.access_token;
    console.log("fetchWithAuth: token from getSession OK", session.user.id);
  } else {
    // Fallback: refresh session from server
    const { data: refreshData } = await supabase.auth.refreshSession();
    if (refreshData.session?.access_token) {
      accessToken = refreshData.session.access_token;
      console.log(
        "fetchWithAuth: token from refreshSession OK",
        refreshData.session.user.id
      );
    } else {
      console.warn("fetchWithAuth: NO TOKEN - user not logged in");
    }
  }

  const headers = {
    "Content-Type": "application/json",
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...options.headers,
  } as HeadersInit;

  return fetch(url, { ...options, headers });
}

export async function runRootCauseAnalysis(companyId: string) {
  return fetchWithAuth('/root-cause/analyze', {
    method: 'POST',
    body: JSON.stringify({ company_id: companyId }),
  });
}
