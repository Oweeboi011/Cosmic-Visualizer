import { NextRequest, NextResponse } from "next/server";
import { getNeos } from "@/lib/nasa/neows";
import { NasaApiError } from "@/types/nasa";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  try {
    const items = await getNeos({
      startDate: searchParams.get("start_date") ?? undefined,
      endDate: searchParams.get("end_date") ?? undefined,
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
      { error: { message: "Unexpected error fetching near-earth object data", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}
