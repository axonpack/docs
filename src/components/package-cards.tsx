import { Card, Cards } from 'fumadocs-ui/components/card';
import { packageHref, packages } from '@/lib/packages';

/**
 * Rendered from `packages.ts` rather than written out in MDX, so a new library appears on every page
 * that lists them without anyone remembering to edit a second list.
 */
export function PackageCards() {
  return (
    <Cards>
      {packages.map((pkg) => (
        <Card key={pkg.slug} title={pkg.name} href={packageHref(pkg)} description={pkg.summary} />
      ))}
    </Cards>
  );
}
