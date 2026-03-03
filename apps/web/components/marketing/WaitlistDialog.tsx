"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WaitlistDialog({ open, onOpenChange }: WaitlistDialogProps) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [nip, setNip] = useState("");
  const [consentRequired, setConsentRequired] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Podaj prawidłowy adres e-mail";
    if (!fullName.trim() || fullName.trim().length < 2)
      errs.fullName = "Imię i nazwisko musi mieć co najmniej 2 znaki";
    if (!companyName.trim() || companyName.trim().length < 2)
      errs.companyName = "Nazwa firmy musi mieć co najmniej 2 znaki";
    if (nip && !/^\d{10}$/.test(nip.replace(/[\s-]/g, "")))
      errs.nip = "NIP musi składać się z 10 cyfr";
    if (!consentRequired)
      errs.consent = "Zgoda jest wymagana do przesłania formularza";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    setServerError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fullName,
          companyName,
          nip: nip || null,
          marketingConsent: consentMarketing,
        }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setServerError(
        "Coś poszło nie tak. Proszę spróbować ponownie lub napisać na: kontakt@gaproll.eu"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setTimeout(() => {
        setSubmitted(false);
        setEmail("");
        setFullName("");
        setCompanyName("");
        setNip("");
        setConsentRequired(false);
        setConsentMarketing(false);
        setFieldErrors({});
        setServerError("");
      }, 300);
    }
    onOpenChange(next);
  };

  const inputBase =
    "w-full rounded-lg px-3.5 py-2.5 text-sm text-[#F1F5F9] placeholder-[#475569] outline-none transition-shadow focus:ring-2 focus:ring-[#2A7BFF] focus:ring-offset-0";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-lg border-[#334155] p-0 overflow-hidden"
        style={{ background: "#1E293B" }}
      >
        <div className="p-6 md:p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-[#F1F5F9]">
              Zarezerwuj miejsce
            </DialogTitle>
            <DialogDescription className="text-[#94A3B8] mt-1">
              Odezwiemy się w ciągu 24 godzin roboczych.
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <CheckCircle className="h-14 w-14 text-[#2A7BFF]" />
              <p className="text-lg font-semibold text-[#F1F5F9]">Dziękujemy!</p>
              <p className="text-[#CBD5E1]">Odezwiemy się wkrótce.</p>
              <p className="text-sm text-[#94A3B8]">Możesz zamknąć to okno.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#CBD5E1] mb-1.5">
                  Adres e-mail <span className="text-[#FF4FA3]">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anna.kowalska@firma.pl"
                  className={inputBase}
                  style={{
                    background: "#0F172A",
                    border: `1px solid ${fieldErrors.email ? "#EF4444" : "#334155"}`,
                  }}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-[#EF4444]">{fieldErrors.email}</p>
                )}
              </div>

              {/* Full name */}
              <div>
                <label className="block text-sm font-medium text-[#CBD5E1] mb-1.5">
                  Imię i nazwisko <span className="text-[#FF4FA3]">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Anna Kowalska"
                  className={inputBase}
                  style={{
                    background: "#0F172A",
                    border: `1px solid ${fieldErrors.fullName ? "#EF4444" : "#334155"}`,
                  }}
                />
                {fieldErrors.fullName && (
                  <p className="mt-1 text-xs text-[#EF4444]">{fieldErrors.fullName}</p>
                )}
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-[#CBD5E1] mb-1.5">
                  Nazwa firmy <span className="text-[#FF4FA3]">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Firma Sp. z o.o."
                  className={inputBase}
                  style={{
                    background: "#0F172A",
                    border: `1px solid ${fieldErrors.companyName ? "#EF4444" : "#334155"}`,
                  }}
                />
                {fieldErrors.companyName && (
                  <p className="mt-1 text-xs text-[#EF4444]">{fieldErrors.companyName}</p>
                )}
              </div>

              {/* NIP */}
              <div>
                <label className="block text-sm font-medium text-[#CBD5E1] mb-1.5">
                  NIP{" "}
                  <span className="font-normal text-[#94A3B8]">(opcjonalnie)</span>
                </label>
                <input
                  type="text"
                  value={nip}
                  onChange={(e) => setNip(e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="1234567890"
                  maxLength={10}
                  className={inputBase}
                  style={{
                    background: "#0F172A",
                    border: `1px solid ${fieldErrors.nip ? "#EF4444" : "#334155"}`,
                  }}
                />
                <p className="mt-1 text-xs text-[#94A3B8]">
                  Po wpisaniu NIP uzupełnimy dane firmy automatycznie
                </p>
                {fieldErrors.nip && (
                  <p className="mt-0.5 text-xs text-[#EF4444]">{fieldErrors.nip}</p>
                )}
              </div>

              {/* RODO checkboxes */}
              <div className="flex flex-col gap-3 mt-1">
                {/* Required */}
                <label className="flex gap-3 items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentRequired}
                    onChange={(e) => setConsentRequired(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded"
                    style={{ accentColor: "#2A7BFF" }}
                  />
                  <span className="text-xs text-[#94A3B8] leading-relaxed">
                    <span className="text-[#FF4FA3]">* </span>
                    Wyrażam zgodę na przetwarzanie moich danych osobowych przez GapRoll Sp. z o.o. z siedzibą w Polsce, w celu obsługi niniejszego zapytania oraz kontaktu w sprawie oferty. Administratorem danych jest GapRoll Sp. z o.o. Podanie danych jest dobrowolne, jednak niezbędne do realizacji powyższego celu. Przysługuje Pani/Panu prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania oraz wniesienia sprzeciwu. Podstawa prawna: art. 6 ust. 1 lit. a oraz lit. b Rozporządzenia RODO (UE) 2016/679.
                  </span>
                </label>
                {fieldErrors.consent && (
                  <p className="text-xs text-[#EF4444] -mt-1">{fieldErrors.consent}</p>
                )}

                {/* Optional marketing */}
                <label className="flex gap-3 items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentMarketing}
                    onChange={(e) => setConsentMarketing(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded"
                    style={{ accentColor: "#2A7BFF" }}
                  />
                  <span className="text-xs text-[#94A3B8] leading-relaxed">
                    Wyrażam zgodę na otrzymywanie od GapRoll Sp. z o.o. informacji handlowych i marketingowych drogą elektroniczną (e-mail) na podany adres. Zgoda jest dobrowolna i może być odwołana w każdej chwili bez wpływu na zgodność z prawem przetwarzania dokonanego przed jej wycofaniem.
                  </span>
                </label>
              </div>

              {/* Privacy note */}
              <p className="text-xs text-[#64748B] leading-relaxed">
                Administratorem Pani/Pana danych osobowych jest GapRoll Sp. z o.o. Pełna treść klauzuli informacyjnej dostępna jest w{" "}
                <a
                  href="/polityka-prywatnosci"
                  className="underline hover:text-[#94A3B8] transition-colors"
                >
                  Polityce Prywatności
                </a>
                .
              </p>

              {/* Server error */}
              {serverError && (
                <p className="text-sm text-[#EF4444]">{serverError}</p>
              )}

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full rounded-xl py-3.5 text-base font-bold text-white transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(255,79,163,0.4)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-1"
                style={{
                  background:
                    "linear-gradient(135deg, #FF4FA3 0%, #9B7FEA 50%, #2A7BFF 100%)",
                  boxShadow: "0 4px 20px rgba(255,79,163,0.3)",
                }}
              >
                {submitting ? "Wysyłanie…" : "Zarezerwuj miejsce →"}
              </button>

              <p className="text-center text-xs text-[#94A3B8]">
                Bez karty kredytowej · Odpowiadamy w ciągu 24h roboczych
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
