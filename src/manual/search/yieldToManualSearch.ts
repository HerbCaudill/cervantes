/** Yield manual search index construction to the browser's next macrotask. */
export function yieldToManualSearch(): Promise<void> {
  return new Promise(resolve => window.setTimeout(resolve, 0))
}
