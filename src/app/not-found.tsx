import Link from 'next/link';
import type { Metadata } from 'next';
import { packages } from '@/lib/packages';

// A static export serves this as 404.html, which is what GitHub Pages hands back for any unknown
// path — so it is the only page a mistyped or stale URL ever reaches.
export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-24">
      <div>
        <p className="font-mono text-sm text-fd-muted-foreground">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">This page does not exist</h1>
        <p className="mt-2 text-fd-muted-foreground">
          It may have moved, or the link that sent you here may be out of date.
        </p>
      </div>
      <ul className="flex flex-col gap-2 text-sm">
        <li>
          <Link className="underline" href="/">
            Start from the introduction
          </Link>
        </li>
        {packages.map((pkg) => (
          <li key={pkg.slug}>
            <Link className="underline" href={`/${pkg.slug}`}>
              {pkg.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
