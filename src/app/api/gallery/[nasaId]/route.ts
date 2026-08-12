import { NextRequest, NextResponse } from "next/server";
import { getGalleryAsset } from "@/lib/nasa/gallery";
import { NasaApiError } from "@/types/nasa";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ nasaId: string }> }
) {
  const { nasaId } = await params;

  try {
    const asset = await getGalleryAsset(nasaId);
    return NextResponse.json(asset);
  } catch (err) {
    if (err instanceof NasaApiError) {
      return NextResponse.json(
        { error: { message: err.message, code: err.code } },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { error: { message: "Unexpected error fetching asset", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}
