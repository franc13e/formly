import { describe, expect, it, vi } from "vitest";
import { licenseLabel, openverseQueries, photoFromOpenverse, searchOpenverse } from "./openverse";

const result = (over: Record<string, unknown> = {}) => ({
  url: "https://live.staticflickr.com/1/oats_b.jpg", creator: "Ana", creator_url: "https://www.flickr.com/photos/ana",
  foreign_landing_url: "https://www.flickr.com/photos/ana/1", license: "by", license_version: "2.0", filetype: "jpg", ...over,
});
const ok = (body: unknown) => ({ ok: true, json: async () => body }) as unknown as Response;

describe("openverseQueries", () => {
  it("tries the full name, then shorter phrases", () => {
    expect(openverseQueries("Berry kefir overnight oats")).toEqual(["berry kefir overnight oats", "overnight oats", "berry kefir", "oats"]);
    expect(openverseQueries("Kimchi fried rice with a fried egg")[1]).toBe("kimchi fried rice fried egg");
  });
  it("de-duplicates short names", () => {
    expect(openverseQueries("Golden milk")).toEqual(["golden milk", "milk"]);
  });
});

describe("photoFromOpenverse", () => {
  it("maps the first usable result", () => {
    expect(photoFromOpenverse({ results: [result()] })).toEqual({
      url: "https://live.staticflickr.com/1/oats_b.jpg", photographer: "Ana", photographer_url: "https://www.flickr.com/photos/ana",
      source_url: "https://www.flickr.com/photos/ana/1", source: "Openverse", license: "CC BY 2.0",
    });
  });
  it("skips http, non-commercial-unknown licences and non-images", () => {
    const pick = photoFromOpenverse({ results: [result({ url: "http://x/a.jpg" }), result({ license: "by-nc" }), result({ filetype: "gif" }), result({ license: "cc0" })] });
    expect(pick?.license).toBe("CC0");
  });
  it("is null for empty or odd data", () => {
    expect(photoFromOpenverse({ results: [] })).toBeNull();
    expect(photoFromOpenverse(null)).toBeNull();
  });
  it("labels licences", () => {
    expect(licenseLabel("by-sa", "4.0")).toBe("CC BY-SA 4.0");
    expect(licenseLabel("pdm", "1.0")).toBe("Public domain");
  });
});

describe("searchOpenverse", () => {
  it("falls back to shorter queries until one has a photo", async () => {
    const fetchFn = vi.fn()
      .mockResolvedValueOnce(ok({ results: [] }))
      .mockResolvedValueOnce(ok({ results: [result()] }));
    const photo = await searchOpenverse("Berry kefir overnight oats", fetchFn as unknown as typeof fetch);
    expect(photo?.photographer).toBe("Ana");
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(String(fetchFn.mock.calls[1][0])).toContain("q=overnight+oats");
  });
  it("gives up (null) when throttled or offline", async () => {
    const throttled = vi.fn().mockResolvedValue({ ok: false, status: 429 });
    expect(await searchOpenverse("oats", throttled as unknown as typeof fetch)).toBeNull();
    const offline = vi.fn().mockRejectedValue(new TypeError("offline"));
    expect(await searchOpenverse("oats", offline as unknown as typeof fetch)).toBeNull();
  });
});
