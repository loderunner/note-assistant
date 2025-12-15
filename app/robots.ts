import type { MetadataRoute } from 'next';

/**
 * Generate static robots.txt file.
 * Allows search engine crawlers while blocking LLM scrapers.
 * This file is statically generated at build time.
 */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Allow all search engines by default
      {
        userAgent: '*',
        allow: '/',
      },
      // Block OpenAI scrapers
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',
      },
      // Block Anthropic scrapers
      {
        userAgent: 'ClaudeBot',
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/',
      },
      // Block other LLM scrapers
      {
        userAgent: 'PerplexityBot',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'Google-Extended',
        disallow: '/',
      },
      {
        userAgent: 'Bytespider',
        disallow: '/',
      },
      {
        userAgent: 'Diffbot',
        disallow: '/',
      },
      {
        userAgent: 'cohere-ai',
        disallow: '/',
      },
      {
        userAgent: 'YouBot',
        disallow: '/',
      },
      {
        userAgent: 'Omgilibot',
        disallow: '/',
      },
      {
        userAgent: 'ImagesiftBot',
        disallow: '/',
      },
      {
        userAgent: 'Applebot-Extended',
        disallow: '/',
      },
    ],
  };
}
