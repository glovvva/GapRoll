"""
Router uploadu plików CSV - podgląd, parsowanie i zapis do Supabase.
"""

import csv
import io
import logging
import re
from typing import Any, Dict, List, Optional

import chardet

logger = logging.getLogger(__name__)
import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from starlette.requests import Request

from limiter import limiter
from routers.auth import get_current_user
from pydantic import BaseModel, Field

from config import settings
from supabase_client import get_supabase_client
from routers.analysis import invalidate_dashboard_cache

router = APIRouter(tags=["upload"])


# --- Pydantic models ---


class SaveDataRequest(BaseModel):
    """Request body dla POST /save - dane do zapisania w Supabase."""

    filename: str = Field(..., max_length=255)
    rows: List[Dict[str, Any]]
    column_mapping: Dict[str, Optional[str]]  # system_field -> csv_column (None = optional, nie mapuj)


# --- Helpers ---


def get_mapped_value(row: Dict[str, Any], mapping: Dict[str, Optional[str]], system_field: str) -> Any:
    """Wyciąga wartość z row używając column_mapping."""
    csv_column = mapping.get(system_field)
    if csv_column and csv_column in row:
        return row[csv_column]
    return None


def parse_salary(value: Any) -> Optional[float]:
    """
    Konwertuje wartość wynagrodzenia (str/int/float) na float.
    Usuwa spacje i zamienia przecinki na kropki. Zwraca None przy błędzie.
    """
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value) if not (value != value) else None  # skip NaN
    s = str(value).strip().replace(" ", "").replace(",", ".")
    s = re.sub(r"[^\d.\-]", "", s)
    if not s:
        return None
    try:
        return float(s)
    except ValueError:
        return None

SEPARATORS = (",", ";", "\t")


def detect_separator(file_content: bytes) -> str:
    """
    Wykrywa separator CSV na podstawie pierwszych 5 linii pliku.
    Liczy wystąpienia ',' vs ';' vs '\\t' i zwraca najczęstszy.
    Fallback: ','.
    """
    try:
        decoded = file_content.decode("utf-8", errors="replace")
    except Exception:
        decoded = file_content.decode("latin-1", errors="replace")
    lines = decoded.splitlines()[:5]
    counts = {sep: 0 for sep in SEPARATORS}
    for line in lines:
        for sep in SEPARATORS:
            counts[sep] += line.count(sep)
    chosen = max(SEPARATORS, key=lambda s: counts[s])
    if counts[chosen] == 0:
        chosen = ","
    tab_count = counts[SEPARATORS[2]]  # "\t"
    logger.debug(
        "Separator counts - semicolon: %s, comma: %s, tab: %s",
        counts[";"],
        counts[","],
        tab_count,
    )
    return chosen


@router.post(
    "/preview",
    response_model=dict[str, Any],
    summary="Podgląd pliku CSV",
    description="Parsuje przesłany plik CSV i zwraca metadane oraz 10 pierwszych wierszy.",
)
@limiter.limit("60/minute")
async def preview_csv(request: Request, file: UploadFile = File(...)) -> dict[str, Any]:
    """
    POST /preview - przyjmuje plik CSV (multipart/form-data), wykrywa encoding i separator,
    parsuje przez pandas i zwraca liczbę wierszy/kolumn, nazwy kolumn oraz 10 pierwszych wierszy.
    """
    if not file.filename or not file.filename.lower().endswith((".csv", ".txt")):
        raise HTTPException(
            status_code=422,
            detail="Nieprawidłowy plik. Oczekiwano pliku CSV (.csv lub .txt).",
        )
    try:
        content: bytes = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Nie udało się odczytać pliku: {e!s}",
        ) from e

    if not content.strip():
        raise HTTPException(
            status_code=422,
            detail="Plik jest pusty.",
        )

    # Usuń UTF-8 BOM z raw bytes (jeśli istnieje) – zanim wykryjemy encoding
    if content.startswith(b"\xef\xbb\xbf"):
        content = content[3:]
        logger.debug("Removed UTF-8 BOM from raw bytes")

    # a) content już odczytany wyżej
    # b) Wykryj encoding - spróbuj typowe polskie encodingi
    polish_encodings = ["utf-8", "windows-1250", "cp1252", "iso-8859-2"]
    decoded_content: str | None = None
    used_encoding = "utf-8"

    for enc in polish_encodings:
        try:
            decoded = content.decode(enc)
            if any(c in decoded for c in "ąćęłńóśźżĄĆĘŁŃÓŚŹŻ"):
                decoded_content = decoded
                used_encoding = enc
                logger.debug("Successfully decoded with %s", enc)
                break
        except Exception:
            continue

    if decoded_content is None:
        detected = chardet.detect(content)
        used_encoding = detected.get("encoding") or "utf-8"
        decoded_content = content.decode(used_encoding, errors="replace")
        logger.debug("Fallback to chardet: %s", used_encoding)

    logger.debug("Detected encoding: %s", used_encoding)

    # c) Wykryj separator PRZED parsowaniem
    separator = detect_separator(content)
    logger.debug("Detected separator: %r", separator)

    # d) Parsuj ze StringIO (sep jest respektowany)

    # First 3 lines (no content logged to avoid PII)
    lines = decoded_content.split("\n")[:3]
    logger.debug("RAW lines count: %s", len(lines))
    for i, line in enumerate(lines):
        logger.debug("  Line %s: semicolons=%s", i, line.count(";"))
    if lines:
        first_line = lines[0]
        logger.debug("First line length: %s", len(first_line))

    logger.debug("About to call pd.read_csv with sep=%r (StringIO)", separator)
    try:
        df = pd.read_csv(
            io.StringIO(decoded_content),
            sep=separator,
            engine="python",
            on_bad_lines="skip",
            skipinitialspace=True,
            quoting=csv.QUOTE_ALL,
            quotechar='"',
        )
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Błąd parsowania CSV: {e!s}",
        ) from e

    logger.debug("DataFrame shape: %s", df.shape)
    logger.debug("Columns: %s", list(df.columns))
    logger.debug("First row: (omitted)")

    if df.empty:
        raise HTTPException(
            status_code=422,
            detail="Plik nie zawiera żadnych danych (brak wierszy po parsowaniu).",
        )

    # Preview: 10 pierwszych wierszy do wyświetlenia w tabeli
    preview_df = df.head(10)
    preview: list[dict[str, Any]] = preview_df.to_dict(orient="records")
    # Wszystkie wiersze do zapisu (save dostaje pełny dataset)
    all_rows: list[dict[str, Any]] = df.to_dict(orient="records")
    # Konwersja NaN/NaT na None dla JSON
    for row in preview:
        for k, v in row.items():
            if pd.isna(v):
                row[k] = None
    for row in all_rows:
        for k, v in row.items():
            if pd.isna(v):
                row[k] = None

    return {
        "filename": file.filename or "unknown.csv",
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "column_names": list(df.columns.astype(str)),
        "preview": preview,
        "all_rows": all_rows,
        "separator": separator,
        "encoding": used_encoding,
    }


@router.post(
    "/save",
    response_model=dict[str, Any],
    summary="Zapisz dane do Supabase",
    description="Batch insert wierszy z preview do tabeli payroll_data.",
)
@limiter.limit("60/minute")
async def save_data(
    request: Request,
    body: SaveDataRequest,
    user_id: str = Depends(get_current_user),
) -> dict[str, Any]:
    """
    POST /save - przyjmuje filename i rows (lista wierszy z preview),
    mapuje kolumny (PL/EN) i wykonuje batch insert do Supabase.
    """
    if not settings.is_supabase_configured():
        raise HTTPException(
            status_code=503,
            detail="Supabase nie jest skonfigurowane (SUPABASE_URL / SUPABASE_KEY).",
        )
    column_mapping = body.column_mapping

    # Mandatory: position, gender, salary (first_name/last_name optional — RODO)
    required_fields = ["position", "gender", "salary"]
    missing = [
        f
        for f in required_fields
        if f not in column_mapping or not column_mapping[f]
    ]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Brakuje wymaganych pól w mapowaniu: {', '.join(missing)}",
        )

    logger.debug("save_data user_id=(redacted)")
    logger.debug("Using column mapping (keys redacted)")

    records: List[Dict[str, Any]] = []
    for row in body.rows:
        record = {
            "user_id": user_id,
            "filename": body.filename,
            "first_name": get_mapped_value(row, column_mapping, "first_name"),
            "last_name": get_mapped_value(row, column_mapping, "last_name"),
            "position": get_mapped_value(row, column_mapping, "position"),
            "gender": get_mapped_value(row, column_mapping, "gender"),
            "salary": parse_salary(
                get_mapped_value(row, column_mapping, "salary")
            ),
            "raw_data": row,
        }
        records.append(record)

    logger.debug("First record: (omitted)")

    if not records:
        return {
            "success": True,
            "inserted_rows": 0,
            "message": "Brak wierszy do zapisania.",
        }

    # Upload does NOT call OpenAI/EVG — EVG scoring is on-demand (EVG tab). Use service role for insert (RLS).
    try:
        key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
        client = get_supabase_client(settings.SUPABASE_URL, key)
        # Delete existing records for this user before inserting new ones (replace upload, not append).
        client.table("payroll_data").delete().eq("user_id", user_id).execute()
        client.table("payroll_data").insert(records).execute()
    except Exception as e:
        err_msg = str(e).lower()
        logger.error("save_data Supabase: %s", e)
        if "api key" in err_msg or "invalid" in err_msg or "authentication" in err_msg:
            detail = "Błąd konfiguracji serwera. Skontaktuj się z administratorem."
        else:
            detail = f"Błąd zapisu do bazy: {e!s}"
        raise HTTPException(status_code=500, detail=detail) from e

    invalidate_dashboard_cache(user_id)

    return {
        "success": True,
        "inserted_rows": len(records),
        "message": "Dane zapisane pomyślnie",
    }
