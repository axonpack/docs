export const appName = 'Axonpack';
export const appTagline = 'Free, open-source foundation libraries for React Native and Expo apps.';

// The docs tree is the site root: the repo is named `docs`, so GitHub Pages already serves
// everything under /docs and a second /docs segment would only double it.
export const docsRoute = '/';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

/**
 * `next/image` does not apply `basePath` to a plain string `src` when `images.unoptimized` is on,
 * and neither does `metadata.icons`. Prefer importing an asset so Next handles both; use this only
 * where an API insists on a string.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const withBasePath = (path: string) => `${basePath}${path}`;

export const gitConfig = {
  user: 'axonpack',
  repo: 'axonpack',
  branch: 'main',
};
