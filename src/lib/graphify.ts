// src/lib/graphify.ts
// Graphify caching wrapper — feature-flagged no-op when disabled
// When GRAPHIFY_ENABLED=true + GRAPHIFY_API_KEY is set, wraps fetchers with cache layer

/**
 * Wraps a data fetcher with Graphify cache layer.
 * When GRAPHIFY_ENABLED is false (default), passes through to the underlying fetcher.
 *
 * @param key Cache key for the data
 * @param fetcher Async function that fetches the data
 * @param ttlSeconds Time-to-live in seconds for the cached data
 * @returns The fetched (or cached) data
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  const enabled = process.env.GRAPHIFY_ENABLED === 'true';
  const apiKey = process.env.GRAPHIFY_API_KEY;

  if (!enabled || !apiKey) {
    // Pass-through when disabled — zero overhead
    return fetcher();
  }

  // TODO: Implement Graphify cache logic when API key is provided
  // For now, always pass through
  void key;
  void ttlSeconds;
  return fetcher();
}
