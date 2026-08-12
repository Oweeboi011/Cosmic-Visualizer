import { NextRequest, NextResponse } from "next/server";
import { getAlerts } from "@/lib/nasa/donki";
import { NasaApiError } from "@/types/nasa";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  try {
    const items = await getAlerts({
      type: searchParams.get("type") ?? undefined,
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
      { error: { message: "Unexpected error fetching space weather alerts", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}
