import { describe, expect, it } from "vitest";
import { tiktokSearchUrl, youtubeSearchUrl } from "./recipeLinks";

describe("recipe video links", () => {
  it("builds a YouTube search for '<name> recipe'", () => {
    expect(youtubeSearchUrl("Golden milk")).toBe("https://www.youtube.com/results?search_query=Golden%20milk%20recipe");
  });

  it("builds a TikTok search for '<name> recipe'", () => {
    expect(tiktokSearchUrl("Golden milk")).toBe("https://www.tiktok.com/search?q=Golden%20milk%20recipe");
  });

  it("encodes &, accents and other reserved characters", () => {
    const yt = youtubeSearchUrl("Red lentil & spinach dal");
    expect(yt).toBe("https://www.youtube.com/results?search_query=Red%20lentil%20%26%20spinach%20dal%20recipe");
    expect(new URL(yt).searchParams.get("search_query")).toBe("Red lentil & spinach dal recipe");

    const tt = tiktokSearchUrl("Crème brûlée oats #1?");
    expect(tt).toBe("https://www.tiktok.com/search?q=Cr%C3%A8me%20br%C3%BBl%C3%A9e%20oats%20%231%3F%20recipe");
    expect(new URL(tt).searchParams.get("q")).toBe("Crème brûlée oats #1? recipe");
  });

  it("trims surrounding whitespace", () => {
    expect(tiktokSearchUrl("  Chai  ")).toBe("https://www.tiktok.com/search?q=Chai%20recipe");
  });
});
