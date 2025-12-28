import { BlobNotFoundError, del, head, put } from '@vercel/blob';
import { z } from 'zod';

export type BlobCache<T> = {
  get: (key: string) => Promise<T | null>;
  set: (key: string, value: T, ttl: number) => Promise<void>;
};

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

/**
 * Creates a blob-based cache client with a specific prefix.
 * Cache entries are stored as JSON with an expiration timestamp.
 * Data from storage is validated against the provided zod schema.
 *
 * @param prefix - Path prefix for this cache (e.g., "summaries/", "transcripts/")
 * @param schema - Zod schema to validate cached values
 * @returns Cache client with get/set methods
 *
 * @example
 * ```ts
 * const cache = createBlobCache('summaries/', bulletPointsSchema);
 * const result = await cache.get('abc123-en'); // typed as BulletPointsResult | null
 * ```
 */
export function createBlobCache<T>(
  prefix: string,
  schema: z.ZodType<T>,
): BlobCache<T> {
  const basePath = `cache/${prefix}`;

  const cacheEntrySchema = z.object({
    expiresAt: z.number(),
    value: schema,
  }) satisfies z.ZodType<CacheEntry<T>>;

  return {
    async get(key: string): Promise<T | null> {
      const pathname = `${basePath}${key}.json`;
      console.debug(`blobCache.get: looking up pathname=${pathname}`);

      try {
        const metadata = await head(pathname);
        console.debug(
          `blobCache.get: found blob for pathname=${pathname}, fetching content`,
        );
        const response = await fetch(metadata.url);
        const json: unknown = await response.json();
        const entry = cacheEntrySchema.parse(json);

        if (entry.expiresAt < Date.now()) {
          console.debug(
            `blobCache.get: entry expired for pathname=${pathname}, deleting`,
          );
          await del(pathname);
          return null;
        }
        console.debug(`blobCache.get: cache hit for pathname=${pathname}`);
        return entry.value;
      } catch (error) {
        if (error instanceof BlobNotFoundError) {
          console.debug(`blobCache.get: cache miss for pathname=${pathname}`);
          return null;
        }
        if (error instanceof z.ZodError) {
          console.warn(
            `blobCache.get: corrupted cache entry at pathname=${pathname}, treating as miss:`,
            error.issues,
          );
          return null;
        }
        throw error;
      }
    },

    async set(key: string, value: T, ttl: number): Promise<void> {
      const pathname = `${basePath}${key}.json`;
      console.debug(
        `blobCache.set: storing at pathname=${pathname} ttl=${ttl}ms`,
      );
      const entry: CacheEntry<T> = {
        expiresAt: Date.now() + ttl,
        value,
      };
      await put(pathname, JSON.stringify(entry), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
      });
      console.debug(`blobCache.set: stored successfully at pathname=${pathname}`);
    },
  };
}
