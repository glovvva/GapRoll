"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  maxSizeMB?: number;
}

export function FileUpload({ onFileSelect, maxSizeMB = 10 }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  function validateAndSetFile(f: File | undefined): boolean {
    setError(null);
    if (!f) {
      setError("Nie wybrano pliku.");
      return false;
    }
    if (!f.name.toLowerCase().endsWith(".csv")) {
      setError("Dozwolony jest tylko format pliku .csv");
      return false;
    }
    if (f.size > maxSizeBytes) {
      setError(`Plik jest za duży. Maksymalny rozmiar: ${maxSizeMB} MB`);
      return false;
    }
    return true;
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    const items = e.dataTransfer.files;
    if (!items?.length) {
      setError("Nie upuszczono żadnego pliku.");
      return;
    }
    if (items.length > 1) {
      setError("Można przesłać tylko jeden plik.");
      return;
    }
    const f = items[0];
    if (!validateAndSetFile(f)) return;
    setFile(f);
    onFileSelect(f);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0];
    if (!f) return;
    if (!validateAndSetFile(f)) return;
    setFile(f);
    onFileSelect(f);
    e.target.value = "";
  };

  const inputId = "csv-upload-input";
  const hasFile = file !== null;

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        role="button"
        tabIndex={0}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          "relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors duration-200",
          "border-border bg-card hover:border-primary/50 hover:bg-primary/5",
          isDragging && "border-primary bg-primary/5",
          hasFile && "border-primary bg-primary/10",
          uploading && "pointer-events-none opacity-70"
        )}
      >
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept=".csv"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          style={{ pointerEvents: "auto" }}
          aria-label="Wybierz plik CSV"
          onChange={handleInputChange}
        />

        {!hasFile ? (
          <>
            <Upload className="mb-3 size-10 text-text-secondary" />
            <p className="text-sm font-medium text-text-primary">
              Przeciągnij plik CSV tutaj
            </p>
            <p className="mt-1 text-sm text-text-secondary">lub kliknij</p>
          </>
        ) : (
          <div className="flex w-full flex-col items-center gap-2">
            <p className="truncate text-sm font-medium text-text-primary" title={file.name}>
              {file.name}
            </p>
            <p className="text-xs text-text-secondary">
              {formatFileSize(file.size)}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-1 relative z-20"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setFile(null);
                setError(null);
              }}
              aria-label="Usuń plik"
            >
              <X className="size-4" />
            </Button>
          </div>
        )}
      </label>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
