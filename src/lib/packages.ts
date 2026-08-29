/**
 * The one list of what Axonpack ships. Adding a library means adding an entry here and a
 * `content/docs/<slug>/` folder — nothing else on the site enumerates packages by hand.
 *
 * **Only published packages belong here.** A planned one has no page, no card and no entry: this
 * site documents what you can install, and a page describing something nobody can install is a
 * promise with nothing behind it. Unshipped work lives in the monorepo's `notes/plan.md`.
 */
export type AxonpackPackage = {
  /** npm name, and the tab title in the docs sidebar. */
  name: string;
  /**
   * The package's own segment, used identically in three places so they never drift:
   * `content/docs/<slug>/`, the `/<slug>` route, and `public/<slug>/` for its assets.
   */
  slug: string;
  summary: string;
};

export const packages: AxonpackPackage[] = [
  {
    name: '@axonpack/expo-devtools',
    slug: 'expo-devtools',
    summary:
      'Browser-style devtools that live inside your app: network, console, performance, storage, crashes and a debug tab, behind a draggable button.',
  },
];

export const packageHref = (pkg: AxonpackPackage) => `/${pkg.slug}`;

/**
 * Search is filtered by the folder a page sits in, which is the same string as the package's slug.
 * The introduction sits at the site root and belongs to no package, so it carries no tag and shows
 * up only in an unfiltered search.
 */
export const searchTags: { value: string; label: string }[] = packages.map((pkg) => ({
  value: pkg.slug,
  label: pkg.slug,
}));

export const npmUrl = (name: string) => `https://www.npmjs.com/package/${name}`;
