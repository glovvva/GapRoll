import { NextRequest, NextResponse } from "next/server";

interface OverrideBody {
  jobId?: string;
  jobTitle?: string;
  newScore: number;
  reason: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OverrideBody;
    const { jobId, jobTitle, newScore, reason } = body;

    if (typeof newScore !== "number" || newScore < 0 || newScore > 100) {
      return NextResponse.json(
        { message: "Nieprawidłowa ocena (0–100)." },
        { status: 400 }
      );
    }

    if (typeof reason !== "string" || !reason.trim()) {
      return NextResponse.json(
        { message: "Uzasadnienie jest wymagane." },
        { status: 400 }
      );
    }

    // TODO: Persist override (Supabase, etc.)
    // await saveEvgOverride({ jobId, jobTitle, newScore, reason });

    return NextResponse.json({
      success: true,
      newScore,
      reason: reason.trim(),
    });
  } catch {
    return NextResponse.json(
      { message: "Wystąpił błąd serwera." },
      { status: 500 }
    );
  }
}
