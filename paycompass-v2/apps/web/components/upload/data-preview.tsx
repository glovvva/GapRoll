"use client";

import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface DataPreviewProps {
  filename: string;
  rows: number;
  columns: number;
  columnNames: string[];
  preview: Record<string, unknown>[];
  separator: string;
  encoding: string;
  onConfirm: () => void;
  onCancel: () => void;
  saving?: boolean;
}

export function DataPreview({
  filename,
  rows,
  columns,
  columnNames,
  preview,
  separator,
  encoding,
  onConfirm,
  onCancel,
  saving = false,
}: DataPreviewProps) {

  const safeColumnNames = columnNames ?? [];
  const safePreview = preview ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">
          Podgląd: {filename}
        </CardTitle>
        <CardDescription>
          Wiersze: {rows} | Kolumny: {columns}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded bg-secondary p-3">
            <p className="text-xs text-muted-foreground">Separator</p>
            <p className="font-mono text-sm text-foreground">{separator}</p>
          </div>
          <div className="rounded bg-secondary p-3">
            <p className="text-xs text-muted-foreground">Encoding</p>
            <p className="font-mono text-sm text-foreground">{encoding}</p>
          </div>
          <div className="rounded bg-secondary p-3">
            <p className="text-xs text-muted-foreground">Preview</p>
            <p className="font-mono text-sm text-foreground">
              {safePreview.length} wierszy
            </p>
          </div>
        </div>

        {/* Tabela */}
        <div className="max-h-96 overflow-x-auto overflow-y-auto rounded border border-border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-secondary">
              <tr>
                {safeColumnNames.map((name) => (
                  <th
                    key={name}
                    className="border-b border-border px-3 py-2 text-left font-medium text-foreground"
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {safePreview.map((row, i) => (
                <tr
                  key={i}
                  className={
                    i % 2 === 0 ? "bg-card" : "bg-secondary/30"
                  }
                >
                  {safeColumnNames.map((col) => (
                    <td
                      key={col}
                      className="border-b border-border px-3 py-2 text-foreground"
                    >
                      {String(row[col] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onCancel} disabled={saving}>
          Anuluj
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? "Zapisywanie..." : "Potwierdź i zapisz"}
        </Button>
      </CardFooter>
    </Card>
  );
}
