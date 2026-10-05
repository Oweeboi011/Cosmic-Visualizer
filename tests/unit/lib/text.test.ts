import { describe, expect, it } from "vitest";
import { decodeHtmlEntities, stripHtml } from "@/lib/text";

describe("decodeHtmlEntities", () => {
  it("decodes named, decimal, and hex references", () => {
    expect(decodeHtmlEntities("Rock &amp; Roll &mdash; &quot;live&quot;")).toBe('Rock & Roll — "live"');
    expect(decodeHtmlEntities("2019&#8211;2026 &#038; beyond&#8230;")).toBe("2019–2026 & beyond…");
    expect(decodeHtmlEntities("it&#x27;s &#X2019;")).toBe("it's ’");
  });

  it("decodes in a single pass", () => {
    expect(decodeHtmlEntities("&amp;lt;b&amp;gt;")).toBe("&lt;b&gt;");
  });

  it("leaves unknown and invalid references alone", () => {
    expect(decodeHtmlEntities("&notanentity; &#0; &#xD800; &#99999999;")).toBe(
      "&notanentity; &#0; &#xD800; &#99999999;"
    );
    expect(decodeHtmlEntities("AT&T")).toBe("AT&T");
  });
});

describe("stripHtml", () => {
  it("removes tags, decodes entities, and collapses whitespace", () => {
    expect(stripHtml("<p>Hubble&#8217;s <b>new</b>\n\n view&nbsp;of M31</p>")).toBe("Hubble’s new view of M31");
  });

  it("keeps encoded markup as text instead of reinterpreting it as tags", () => {
    expect(stripHtml("Use &lt;img&gt; tags")).toBe("Use <img> tags");
  });
});
