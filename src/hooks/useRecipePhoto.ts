import { useEffect, useReducer } from "react";
import { getRecipePhoto } from "../lib/api";
import { createPhotoStore } from "../lib/recipePhotos";
import type { RecipePhoto } from "../types";

function browserStorage(): Storage | null {
  try {
    return localStorage;
  } catch {
    return null;
  }
}

// One cache for the whole app (memory + localStorage "formly:recipe-photos").
const store = createPhotoStore(getRecipePhoto, browserStorage());

/** The food photo (Pexels / Openverse) for a recipe name or photo query, fetched once and cached. `loading` is true until the lookup settles. */
export function useRecipePhoto(name: string): { loading: boolean; photo: RecipePhoto | null } {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const cached = store.peek(name);

  useEffect(() => {
    if (store.peek(name) !== undefined) return;
    let live = true;
    void store.load(name).then(() => { if (live) rerender(); });
    return () => { live = false; };
  }, [name]);

  return { loading: cached === undefined, photo: cached ?? null };
}
