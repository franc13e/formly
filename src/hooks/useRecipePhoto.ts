import { useEffect, useReducer } from "react";
import { getRecipePhoto } from "../lib/api";
import { searchOpenverse } from "../lib/openverse";
import { createPhotoStore } from "../lib/recipePhotos";
import type { RecipePhoto } from "../types";

function browserStorage(): Storage | null {
  try {
    return localStorage;
  } catch {
    return null;
  }
}

// Openverse from the browser first (each user has their own rate limit), then the server
// (Pexels when it has a key). One cache for the whole app (memory + localStorage "formly:recipe-photos").
const store = createPhotoStore(async name => (await searchOpenverse(name)) ?? getRecipePhoto(name), browserStorage());

/** The food photo (Pexels / Openverse) for a recipe name or photo query, fetched once and cached. `loading` is true until the lookup settles. */
export function useRecipePhoto(name: string, stored?: RecipePhoto): { loading: boolean; photo: RecipePhoto | null } {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const cached = stored ?? store.peek(name);

  useEffect(() => {
    // Curated recipes ship with their photo; only look up the rest.
    if (stored || store.peek(name) !== undefined) return;
    let live = true;
    void store.load(name).then(() => { if (live) rerender(); });
    return () => { live = false; };
  }, [name, stored]);

  return { loading: cached === undefined, photo: cached ?? null };
}
