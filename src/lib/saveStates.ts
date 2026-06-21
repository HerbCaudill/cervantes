import { STORAGE_KEY } from "@/constants"
import type { StateMap } from "@/types"

/** Persist all card scheduling states to localStorage. */
export function saveStates(
  /** Map of card id to its scheduling state */
  states: StateMap,
): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(states))
}
