import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <EmptyState message="This page has drifted out of orbit." />
      <Link href="/" className="text-sm font-medium text-nebula-secondary hover:underline">
        Return to Overview
      </Link>
    </div>
  );
}
