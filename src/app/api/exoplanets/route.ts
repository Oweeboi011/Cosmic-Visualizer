import { NextRequest, NextResponse } from "next/server";
import { getExoplanets } from "@/lib/nasa/exoplanets";
import { NasaApiError } from "@/types/nasa";
import { parseIntParam } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  try {
    const result = await getExoplanets({
      limit: parseIntParam(searchParams.get("limit") ?? undefined, 50, 1, 200),
      discoveryMethod: searchParams.get("discovery_method") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof NasaApiError) {
      return NextResponse.json(
        { error: { message: err.message, code: err.code } },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { error: { message: "Unexpected error fetching exoplanet data", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}
