import { describe, expect, it, vi, afterEach } from "vitest";
import { getAlerts } from "@/lib/nasa/donki";

function mockNotifications(body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(body), { status: 200 }))
  );
}

describe("getAlerts", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("derives 'severe' severity from strong keywords", async () => {
    mockNotifications([
      {
        messageType: "GST",
        messageID: "20260101-AL-001",
        messageIssueTime: "2026-01-01T00:00:00Z",
        messageBody: "Extreme geomagnetic storm (G5) expected.",
      },
    ]);
    const [item] = await getAlerts();
    expect(item.severity).toBe("severe");
    expect(item.type).toBe("GST");
  });

  it("derives 'info' severity when no keywords match", async () => {
    mockNotifications([
      {
        messageType: "report",
        messageID: "20260101-RPT-001",
        messageIssueTime: "2026-01-01T00:00:00Z",
        messageBody: "Routine space weather summary report.",
      },
    ]);
    const [item] = await getAlerts();
    expect(item.severity).toBe("info");
  });

  it("sorts newest notifications first", async () => {
    mockNotifications([
      {
        messageType: "FLR",
        messageID: "old",
        messageIssueTime: "2026-01-01T00:00:00Z",
        messageBody: "Older flare.",
      },
      {
        messageType: "FLR",
        messageID: "new",
        messageIssueTime: "2026-01-05T00:00:00Z",
        messageBody: "Newer flare.",
      },
    ]);
    const items = await getAlerts();
    expect(items.map((i) => i.id)).toEqual(["new", "old"]);
  });

  it("ignores an unrecognized type filter and defaults to 'all'", async () => {
    const fetchMock = vi.fn(async (_url: string) => new Response(JSON.stringify([]), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await getAlerts({ type: "not-a-real-type" });
    const calledUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(calledUrl.searchParams.get("type")).toBe("all");
  });
});
