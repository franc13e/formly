// ─── Recipe video search links ────────────────────────────────────────────────

const searchTerms = (name: string) => encodeURIComponent(`${name.trim()} recipe`);

/** YouTube search results for "<name> recipe". */
export function youtubeSearchUrl(name: string): string {
  return `https://www.youtube.com/results?search_query=${searchTerms(name)}`;
}

/** TikTok search results for "<name> recipe". */
export function tiktokSearchUrl(name: string): string {
  return `https://www.tiktok.com/search?q=${searchTerms(name)}`;
}
