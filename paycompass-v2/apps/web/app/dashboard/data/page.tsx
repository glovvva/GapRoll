"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileUpload } from "@/components/upload/file-upload";
import { DataPreview } from "@/components/upload/data-preview";

export interface PreviewResponse {
  filename: string;
  rows: number;
  columns: number;
  column_names: string[];
  preview: Record<string, unknown>[];
  separator: string;
  encoding: string;
}

export default function DataPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadPreview(file: File) {
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload/preview", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? data.error ?? `Błąd ${res.status}`);
      }
      const data: PreviewResponse = await res.json();
      setPreviewData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się sparsować pliku.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelect(selectedFile: File) {
    setFile(selectedFile);
    uploadPreview(selectedFile);
  }

  async function handleConfirm() {
    if (!previewData) return;

    try {
      setSaving(true);
      setError(null);

      const response = await fetch("/api/upload/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: previewData.filename,
          rows: previewData.preview,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail ?? errorData.message ?? "Błąd zapisu"
        );
      }

      const result = (await response.json()) as { inserted_rows?: number };
      const inserted = result.inserted_rows ?? previewData.preview.length;

      alert(`✅ Sukces! Zapisano ${inserted} wierszy`);

      setFile(null);
      setPreviewData(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Błąd zapisu do bazy danych"
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setFile(null);
    setPreviewData(null);
    setError(null);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Upload Danych CSV</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!file && !previewData && (
            <FileUpload onFileSelect={handleFileSelect} />
          )}

          {uploading && (
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Parsowanie CSV...</p>
            </div>
          )}

          {previewData && !uploading && (
            <DataPreview
              filename={previewData.filename}
              rows={previewData.rows}
              columns={previewData.columns}
              columnNames={previewData.column_names}
              preview={previewData.preview}
              separator={previewData.separator}
              encoding={previewData.encoding}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              saving={saving}
            />
          )}

          {error && !uploading && (
            <div
              className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
