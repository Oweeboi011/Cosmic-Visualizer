import { NextRequest, NextResponse } from "next/server";
import { searchGallery } from "@/lib/nasa/gallery";
import { NasaApiError } from "@/types/nasa";
import { parseIntParam } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  try {
    const result = await searchGallery({
      q: searchParams.get("q") ?? undefined,
      page: parseIntParam(searchParams.get("page") ?? undefined, 1, 1, 500),
    });
    // Search results change rarely; let the CDN absorb repeat queries.
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600" },
    });
  } catch (err) {
    if (err instanceof NasaApiError) {
      return NextResponse.json(
        { error: { message: err.message, code: err.code } },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { error: { message: "Unexpected error searching the image library", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}
