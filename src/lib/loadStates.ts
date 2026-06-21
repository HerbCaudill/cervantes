import { STORAGE_KEY } from "@/constants"
import type { StateMap } from "@/types"

/** Load all saved card scheduling states from localStorage, keyed by card id. */
export function loadStates(): StateMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StateMap) : {}
  } catch {
    // corrupt or unavailable storage shouldn't crash the app — start fresh
    return {}
  }
}
