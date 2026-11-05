import { describe, expect, it, vi } from "vitest";
import { createPhotoStore, MAX_STORED_PHOTOS, parseRecipePhoto, photoQueryKey, rememberPhoto, STORAGE_KEY } from "./recipePhotos";
import type { RecipePhoto } from "../types";

const photo = (n = 1): RecipePhoto => ({
  url: `https://live.staticflickr.com/${n}/photo_b.jpg`,
  photographer: "Ana Cook",
  photographer_url: "https://www.flickr.com/photos/ana",
  source_url: `https://www.flickr.com/photos/ana/${n}`,
  source: "Openverse",
  license: "CC BY 2.0",
});

const pexelsPhoto: RecipePhoto = {
  url: "https://images.pexels.com/123/large.jpeg",
  photographer: "Ana Cook",
  photographer_url: "https://www.pexels.com/@ana",
  source_url: "https://www.pexels.com/photo/123/",
  source: "Pexels",
  license: "Pexels License",
};

// The shape cached by the earlier Pexels-only version.
const legacyPhoto = {
  url: "https://images.pexels.com/1/large.jpeg",
  photographer: "Ana Cook",
  photographer_url: "https://www.pexels.com/@ana",
  pexels_url: "https://www.pexels.com/photo/1/",
};

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: vi.fn((k: string, v: string) => { data.set(k, v); }),
  };
}

describe("photoQueryKey", () => {
  it("normalises case and whitespace", () => {
    expect(photoQueryKey("  Kefir   BERRY smoothie ")).toBe("kefir berry smoothie");
  });
});

describe("parseRecipePhoto", () => {
  it("accepts the API shape for both sources", () => {
    expect(parseRecipePhoto(photo())).toEqual(photo());
    expect(parseRecipePhoto(pexelsPhoto)).toEqual(pexelsPhoto);
  });

  it("returns null for no photo or unsafe urls", () => {
    expect(parseRecipePhoto({ url: null })).toBeNull();
    expect(parseRecipePhoto(null)).toBeNull();
    expect(parseRecipePhoto({ url: "javascript:alert(1)" })).toBeNull();
    expect(parseRecipePhoto({ ...photo(), url: "http://images.pexels.com/x.jpg" })).toBeNull();
  });

  it("rejects an unknown source, a missing license and the old Pexels-only shape", () => {
    expect(parseRecipePhoto({ ...photo(), source: "Flickr" })).toBeNull();
    expect(parseRecipePhoto({ ...photo(), license: undefined })).toBeNull();
    expect(parseRecipePhoto({ ...photo(), license: "  " })).toBeNull();
    expect(parseRecipePhoto(legacyPhoto)).toBeNull();
  });

  it("blanks missing or unsafe credit fields", () => {
    expect(parseRecipePhoto({ url: "https://live.staticflickr.com/x.jpg", source: "Openverse", license: " CC0 ", photographer: 7, photographer_url: "javascript:x", source_url: "http://flickr.com/x" })).toEqual({
      url: "https://live.staticflickr.com/x.jpg",
      photographer: "",
      photographer_url: "",
      source_url: "",
      source: "Openverse",
      license: "CC0",
    });
  });
});

describe("rememberPhoto", () => {
  it("keeps the newest entries up to the cap", () => {
    let map: Record<string, RecipePhoto> = {};
    for (let i = 0; i < 5; i++) map = rememberPhoto(map, `q${i}`, photo(i), 3);
    expect(Object.keys(map)).toEqual(["q2", "q3", "q4"]);
    // Re-adding moves an entry to the newest position.
    expect(Object.keys(rememberPhoto(map, "q2", photo(2), 3))).toEqual(["q3", "q4", "q2"]);
  });
});

describe("createPhotoStore", () => {
  it("fetches once, shares in-flight requests and persists found photos", async () => {
    const storage = memoryStorage();
    const fetcher = vi.fn(async () => photo());
    const store = createPhotoStore(fetcher, storage);

    expect(store.peek("Golden milk")).toBeUndefined();
    const [a, b] = await Promise.all([store.load("Golden milk"), store.load("golden  MILK")]);
    expect(a).toEqual(photo());
    expect(b).toEqual(photo());
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(store.peek("Golden milk")).toEqual(photo());
    expect(JSON.parse(storage.data.get(STORAGE_KEY)!)).toEqual({ "golden milk": photo() });

    // A fresh store (new page load) reads it back without fetching.
    const fetcher2 = vi.fn(async () => photo(2));
    const reloaded = createPhotoStore(fetcher2, storage);
    expect(reloaded.peek("Golden milk")).toEqual(photo());
    await reloaded.load("Golden milk");
    expect(fetcher2).not.toHaveBeenCalled();
  });

  it("remembers misses and errors for the session only", async () => {
    const storage = memoryStorage();
    const fetcher = vi.fn<(name: string) => Promise<RecipePhoto | null>>()
      .mockResolvedValueOnce(null)
      .mockRejectedValueOnce(new Error("offline"));
    const store = createPhotoStore(fetcher, storage);
    expect(await store.load("Mystery stew")).toBeNull();
    expect(await store.load("Chai")).toBeNull();
    expect(store.peek("Mystery stew")).toBeNull();
    await store.load("Mystery stew");
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("caps the stored map", async () => {
    const storage = memoryStorage();
    const store = createPhotoStore(async (name) => photo(Number(name.slice(1))), storage);
    for (let i = 0; i < MAX_STORED_PHOTOS + 5; i++) await store.load(`r${i}`);
    const saved = JSON.parse(storage.data.get(STORAGE_KEY)!) as Record<string, RecipePhoto>;
    expect(Object.keys(saved)).toHaveLength(MAX_STORED_PHOTOS);
    expect(saved.r0).toBeUndefined();
    expect(saved[`r${MAX_STORED_PHOTOS + 4}`]).toBeDefined();
  });

  it("ignores corrupt storage and storage errors", async () => {
    const storage = memoryStorage({ [STORAGE_KEY]: "{not json" });
    storage.setItem.mockImplementation(() => { throw new Error("quota"); });
    const store = createPhotoStore(async () => photo(), storage);
    expect(store.peek("Chai")).toBeUndefined();
    expect(await store.load("Chai")).toEqual(photo());
    expect(store.peek("Chai")).toEqual(photo());
  });

  it("treats old-shape stored entries as missing", async () => {
    const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify({ "golden milk": legacyPhoto, chai: photo(3) }) });
    const fetcher = vi.fn(async () => photo(2));
    const store = createPhotoStore(fetcher, storage);
    expect(store.peek("Golden milk")).toBeUndefined();
    expect(store.peek("Chai")).toEqual(photo(3));
    expect(await store.load("Golden milk")).toEqual(photo(2));
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(JSON.parse(storage.data.get(STORAGE_KEY)!)).toEqual({ chai: photo(3), "golden milk": photo(2) });
  });

  it("works without storage", async () => {
    const store = createPhotoStore(async () => photo(), null);
    expect(await store.load("Chai")).toEqual(photo());
  });
});
