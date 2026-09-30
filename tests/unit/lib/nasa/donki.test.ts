import { describe, expect, it, vi, afterEach } from "vitest";
import { deriveSeverity, getAlerts } from "@/lib/nasa/donki";

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

describe("deriveSeverity", () => {
  it.each([
    ["GST", "Extreme geomagnetic storm expected.", "severe"],
    ["GST", "G4 conditions observed.", "severe"],
    ["FLR", "An X1.2 flare peaked at 12:00Z.", "severe"],
    ["FLR", "Significant x-class flare activity.", "severe"],
    ["SEP", "S3 radiation storm in progress.", "warning"],
    ["FLR", "M5.1 flare detected.", "warning"],
    ["GST", "Strong storm conditions.", "warning"],
    ["GST", "Minor G1 conditions possible.", "watch"],
    ["CME", "Moderate CME, a glancing blow is possible.", "watch"],
    ["CME", "Fast CME detected.", "info"],
  ] as const)("%s %j → %s", (type, body, expected) => {
    expect(deriveSeverity(type, body)).toBe(expected);
  });

  it("matches scale levels and flare classes only as whole tokens", () => {
    // "FR1"/"R12"/"GX1" contain R1/X1 but aren't scale levels or flare classes.
    expect(deriveSeverity("report", "Region FR1 near R12, see GX1 and AR3456.")).toBe("info");
    // Lowercase letters aren't NOAA scale levels (e.g. "r3" in an identifier).
    expect(deriveSeverity("report", "model run r3 g5 complete")).toBe("info");
  });
});

describe("getAlerts (DONKI API)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls the CCMC DONKI API, not the api.nasa.gov proxy, and sends no key", async () => {
    const fetchMock = vi.fn(async (_url: string) => new Response(JSON.stringify([]), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await getAlerts();
    const calledUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(calledUrl.origin + calledUrl.pathname).toBe("https://ccmc.gsfc.nasa.gov/DONKI-API/get/notifications");
    expect(calledUrl.searchParams.has("api_key")).toBe(false);
  });

  it("titles an empty-bodied notification with the readable type name", async () => {
    mockNotifications([
      {
        messageType: "RBE",
        messageID: "20260902-AL-001",
        messageIssueTime: "2026-09-02T12:23Z",
        messageBody: "## ",
      },
    ]);
    const [item] = await getAlerts();
    expect(item.title).toBe("Radiation belt enhancement");
    expect(item.summary).toBe("");
  });
});
