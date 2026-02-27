import { createClient } from "@/lib/supabase/client";

/** Cache dla widoków: url -> { data, timestamp }. TTL 60s — nie fetchuj ponownie jeśli dane świeże. */
const viewCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 60_000;

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

/** GET z cache 60s — dla widoków (Pay Gap, Art. 16, dashboard-metrics) żeby uniknąć wielokrotnego fetchu. */
export async function fetchWithAuthCached(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = (options.method || "GET").toUpperCase();
  if (method !== "GET") {
    return fetchWithAuth(url, options);
  }
  const entry = viewCache.get(url);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return new Response(JSON.stringify(entry.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  const res = await fetchWithAuth(url, options);
  if (res.ok) {
    try {
      const data = await res.clone().json();
      viewCache.set(url, { data, timestamp: Date.now() });
    } catch {
      // ignore
    }
  }
  return res;
}

export async function runRootCauseAnalysis(companyId: string) {
  return fetchWithAuth('/root-cause/analyze', {
    method: 'POST',
    body: JSON.stringify({ company_id: companyId }),
  });
}
