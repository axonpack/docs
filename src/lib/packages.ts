import type { StaticImageData } from 'next/image';
import consoleLog from '../../public/expo-devtools/screenshots/console-log.png';
import networkLog from '../../public/expo-devtools/screenshots/network-log.png';
import perfStatistics from '../../public/expo-devtools/screenshots/perf-statistics.png';

/**
 * The one list of what Axonpack ships. Adding a library means adding an entry here and a
 * `content/docs/<slug>/` folder — nothing else on the site enumerates packages by hand.
 */
export type PackageStatus = 'shipped' | 'planned';

export type AxonpackPackage = {
  /** npm name, and the tab title in the docs sidebar. */
  name: string;
  /**
   * The package's own segment, used identically in three places so they never drift:
   * `content/docs/<slug>/`, the `/<slug>` route, and `public/<slug>/` for its assets.
   */
  slug: string;
  status: PackageStatus;
  summary: string;
  /**
   * Shown on the landing page. Imported rather than referenced by path: `next/image` leaves a string
   * `src` unprefixed under a base path, and a static import cannot be got wrong that way.
   */
  heroShots?: { image: StaticImageData; alt: string; caption: string }[];
};

export const packages: AxonpackPackage[] = [
  {
    name: '@axonpack/expo-devtools',
    slug: 'expo-devtools',
    status: 'shipped',
    summary:
      'Browser-style devtools that live inside your app: network, console, performance, storage, crashes and a debug tab, behind a draggable button.',
    heroShots: [
      {
        image: networkLog,
        alt: 'Network tab listing captured requests',
        caption: 'Every request as it happens, in-app browser traffic included.',
      },
      {
        image: consoleLog,
        alt: 'Console tab listing captured logs',
        caption: 'Every log, with objects you can open up and explore.',
      },
      {
        image: perfStatistics,
        alt: 'Performance tab showing frame rate and memory charts',
        caption: 'Frame rate, memory and startup, measured on the device.',
      },
    ],
  },
  {
    name: '@axonpack/lite-storage',
    slug: 'lite-storage',
    status: 'planned',
    summary:
      'Local storage on SQLite with in-memory caching, one AsyncStorage-shaped interface, and debounced batched writes.',
  },
  {
    name: '@axonpack/api-kit',
    slug: 'api-kit',
    status: 'planned',
    summary:
      'An HTTP client factory with auth built in: single-flight 401 refresh and retry, and a token service that caches in sync and persists on a debounce.',
  },
  {
    name: '@axonpack/i18n',
    slug: 'i18n',
    status: 'planned',
    summary: 'Type-safe translations without a configuration file to maintain.',
  },
];

export const shippedPackages = packages.filter((pkg) => pkg.status === 'shipped');

/** A planned package has no docs to link to — it is named, and that is all. */
export function packageHref(pkg: AxonpackPackage): string | undefined {
  return pkg.status === 'shipped' ? `/${pkg.slug}` : undefined;
}

export const npmUrl = (name: string) => `https://www.npmjs.com/package/${name}`;

/**
 * Search is filtered by the folder a page sits in, which is the same string as the package's slug.
 * The introduction sits at the site root and belongs to no package, so it carries no tag and shows
 * up only in an unfiltered search.
 */
export const searchTags: { value: string; label: string }[] = shippedPackages.map((pkg) => ({
  value: pkg.slug,
  label: pkg.slug,
}));
