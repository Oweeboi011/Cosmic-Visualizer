import { NextRequest, NextResponse } from "next/server";
import { getApod } from "@/lib/nasa/apod";
import { NasaApiError } from "@/types/nasa";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  try {
    const items = await getApod({
      date: searchParams.get("date") ?? undefined,
      startDate: searchParams.get("start_date") ?? undefined,
      endDate: searchParams.get("end_date") ?? undefined,
      count: searchParams.get("count") ? Number(searchParams.get("count")) : undefined,
    });
    return NextResponse.json({ items });
  } catch (err) {
    if (err instanceof NasaApiError) {
      return NextResponse.json(
        { error: { message: err.message, code: err.code } },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { error: { message: "Unexpected error fetching APOD data", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}
