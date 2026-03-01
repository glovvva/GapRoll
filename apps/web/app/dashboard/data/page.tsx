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
import { ColumnMapper, type ColumnMapping } from "@/components/upload/column-mapper";
import { fetchWithAuth } from "@/lib/api-client";

export interface PreviewResponse {
  filename: string;
  rows: number;
  columns: number;
  column_names: string[];
  /** Pierwsze 10 wierszy do podglądu w tabeli */
  preview: Record<string, unknown>[];
  /** Wszystkie wiersze do przekazania do save (pełny dataset) */
  all_rows?: Record<string, unknown>[];
  separator: string;
  encoding: string;
}

type Step = "upload" | "preview" | "mapping" | "saving";

export default function DataPage() {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<{ count: number } | null>(null);

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
      setStep("preview");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nie udało się sparsować pliku."
      );
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelect(selectedFile: File) {
    setUploadSuccess(null);
    setFile(selectedFile);
    uploadPreview(selectedFile);
  }

  function handleNextToMapping() {
    setStep("mapping");
  }

  function handleMappingComplete(mapping: ColumnMapping) {
    setColumnMapping(mapping);
    handleSave(mapping);
  }

  async function handleSave(mapping: ColumnMapping) {
    if (!previewData) return;

    setStep("saving");
    setSaving(true);
    setError(null);

    try {
      const rowsToSave = previewData.all_rows ?? previewData.preview;
      const response = await fetchWithAuth("/api/upload/save", {
        method: "POST",
        body: JSON.stringify({
          filename: previewData.filename,
          rows: rowsToSave,
          column_mapping: mapping,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail ?? errorData.message ?? "Błąd zapisu"
        );
      }

      const result = (await response.json()) as { inserted_rows?: number };
      const inserted = result.inserted_rows ?? (previewData.all_rows ?? previewData.preview).length;

      setUploadSuccess({ count: inserted });

      setFile(null);
      setPreviewData(null);
      setColumnMapping(null);
      setStep("upload");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Błąd zapisu do bazy danych"
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancelPreview() {
    setStep("upload");
    setFile(null);
    setPreviewData(null);
    setError(null);
  }

  return (
    <div className="mx-auto max-w-7xl">
      {uploadSuccess && (
        <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded-lg flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-green-400 font-semibold text-base">
              Dane wgrane pomyślnie
            </p>
            <p className="text-green-300 text-sm">
              Zapisano {uploadSuccess.count} pracowników. Przejdź do sekcji Pay Gap lub Art. 16, aby zobaczyć analizę.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setUploadSuccess(null)}
            className="ml-auto text-green-400 hover:text-green-200 text-xl leading-none"
            aria-label="Zamknij"
          >
            ×
          </button>
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-text-primary">Upload Danych CSV</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {uploading && (
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-text-secondary">Parsowanie CSV...</p>
            </div>
          )}

          {!uploading && step === "upload" && !previewData && (
            <FileUpload onFileSelect={handleFileSelect} />
          )}

          {!uploading && step === "preview" && previewData && (
            <DataPreview
              filename={previewData.filename}
              rows={previewData.rows}
              columns={previewData.columns}
              columnNames={previewData.column_names}
              preview={previewData.preview}
              separator={previewData.separator}
              encoding={previewData.encoding}
              onConfirm={handleNextToMapping}
              onCancel={handleCancelPreview}
              primaryButtonLabel="Dalej"
            />
          )}

          {!uploading && step === "mapping" && previewData && (
            <ColumnMapper
              csvColumns={previewData.column_names}
              onMappingComplete={handleMappingComplete}
              onCancel={() => setStep("preview")}
            />
          )}

          {step === "saving" && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="size-8 animate-spin text-primary" />
              <span className="ml-3 text-sm text-text-secondary">
                Zapisywanie danych...
              </span>
            </div>
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
