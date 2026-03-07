"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { fetchWithAuth } from "@/lib/api-client";

export default function NowyRecznyWniosekPage() {
  const router = useRouter();
  const [employeeName, setEmployeeName] = useState("");
  const [employeePosition, setEmployeePosition] = useState("");
  const [submittedChannel, setSubmittedChannel] = useState<"ustny" | "papierowy">("ustny");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeName.trim() || !employeePosition.trim()) {
      setError("Wypełnij imię i nazwisko oraz stanowisko.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetchWithAuth("/api/employee-requests/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_name: employeeName.trim(),
          employee_position: employeePosition.trim(),
          submitted_channel: submittedChannel,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.detail || "Nie udało się zapisać wniosku.");
        return;
      }

      router.push("/dashboard/wnioski");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard/wnioski" className="hover:underline">
          Skrzynka wniosków
        </Link>
        <span>/</span>
        <span>Wprowadź wniosek ręczny</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wniosek ręczny (Track B)</CardTitle>
          <CardDescription>
            Wprowadzenie wniosku złożonego ustnie lub na piśmie — bez logowania pracownika. Zgodnie z
            Art. 7 Dyrektywy UE 2023/970.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="employee_name">Imię i nazwisko pracownika *</Label>
              <Input
                id="employee_name"
                type="text"
                placeholder="Jan Kowalski"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee_position">Stanowisko / grupa EVG</Label>
              <Input
                id="employee_position"
                type="text"
                placeholder="np. Specjalista ds. HR"
                value={employeePosition}
                onChange={(e) => setEmployeePosition(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>Kanał złożenia wniosku</Label>
              <Select
                value={submittedChannel}
                onValueChange={(v) => setSubmittedChannel(v as "ustny" | "papierowy")}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ustny">Ustny</SelectItem>
                  <SelectItem value="papierowy">Papierowy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Zapisywanie...
                  </>
                ) : (
                  "Zapisz wniosek"
                )}
              </Button>
              <Link href="/dashboard/wnioski">
                <Button type="button" variant="outline">
                  Anuluj
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
