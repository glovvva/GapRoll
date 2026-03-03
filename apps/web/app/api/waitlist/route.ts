/*
 * SQL — uruchom jednorazowo w Supabase SQL Editor:
 *
 * CREATE TABLE IF NOT EXISTS waitlist (
 *   id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
 *   email             text        NOT NULL,
 *   full_name         text        NOT NULL,
 *   company_name      text        NOT NULL,
 *   nip               text,
 *   marketing_consent boolean     NOT NULL DEFAULT false,
 *   created_at        timestamptz NOT NULL DEFAULT now()
 * );
 * ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Allow anon inserts"
 *   ON waitlist FOR INSERT TO anon WITH CHECK (true);
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  const { email, fullName, companyName, nip, marketingConsent } = body as {
    email?: string;
    fullName?: string;
    companyName?: string;
    nip?: string | null;
    marketingConsent?: boolean;
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return NextResponse.json({ error: "Nieprawidłowy adres e-mail" }, { status: 400 });
  }
  if (!fullName || fullName.trim().length < 2) {
    return NextResponse.json(
      { error: "Imię i nazwisko jest wymagane (min. 2 znaki)" },
      { status: 400 }
    );
  }
  if (!companyName || companyName.trim().length < 2) {
    return NextResponse.json(
      { error: "Nazwa firmy jest wymagana (min. 2 znaki)" },
      { status: 400 }
    );
  }

  const supabase = createClient();

  const { error } = await supabase.from("waitlist").insert({
    email: email.toLowerCase().trim(),
    full_name: fullName.trim(),
    company_name: companyName.trim(),
    nip: nip ? nip.replace(/[\s-]/g, "") : null,
    marketing_consent: marketingConsent ?? false,
  });

  if (error) {
    return NextResponse.json({ error: "Błąd bazy danych" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
