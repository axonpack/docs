/**
 * Two names, deliberately. `appName` is what appears in chrome where space is tight and the reader
 * already knows where they are — the nav, a browser tab suffix. `appLongName` is the full name, used
 * where the site introduces itself to someone who has not seen it before: a shared link's title, an
 * OG card, a search result.
 */
export const appName = 'Axonpack';
export const appLongName = 'Axonpack Open Source';
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

/** The project. Used for the nav link, which is about Axonpack as a whole. */
export const gitConfig = {
  user: 'axonpack',
  repo: 'axonpack',
  branch: 'main',
};

/**
 * The repository these pages live in — this one. Separate from `gitConfig` on purpose: a page's
 * "open in GitHub" link has to resolve to the file, and the file is not in the monorepo.
 */
export const docsRepo = {
  user: 'axonpack',
  repo: 'docs',
  branch: 'main',
};

export const pageSourceUrl = (path: string) =>
  `https://github.com/${docsRepo.user}/${docsRepo.repo}/blob/${docsRepo.branch}/content/docs/${path}`;
