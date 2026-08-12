import { NextRequest, NextResponse } from "next/server";
import { getFindings } from "@/lib/nasa/findings";
import type { FindingAgency } from "@/types/nasa";

const KNOWN_AGENCIES: FindingAgency[] = ["NASA", "ESA", "ESO"];

export async function GET(request: NextRequest) {
  // getFindings() never throws — it falls back to static data internally — so
  // this route always returns 200 with usable content.
  const { searchParams } = new URL(request.url);
  const requestedAgency = searchParams.get("agency");
  const agency = KNOWN_AGENCIES.find((a) => a === requestedAgency);
  const items = await getFindings({ agency });
  return NextResponse.json({ items });
}
