import { Card, Cards } from 'fumadocs-ui/components/card';
import { packageHref, packages } from '@/lib/packages';

/**
 * Rendered from `packages.ts` rather than written out in MDX, so a new library appears on every page
 * that lists them without anyone remembering to edit a second list. A planned package has no page to
 * open, so it is stated rather than linked — a card that goes nowhere reads as a broken one.
 */
export function PackageCards() {
  const shipped = packages.filter((pkg) => pkg.status === 'shipped');
  const planned = packages.filter((pkg) => pkg.status === 'planned');

  return (
    <>
      <Cards>
        {shipped.map((pkg) => (
          <Card key={pkg.slug} title={pkg.name} href={packageHref(pkg)} description={pkg.summary} />
        ))}
      </Cards>
      {planned.length > 0 && (
        <dl className="my-6 flex flex-col gap-4 border-l-2 pl-4 text-sm">
          {planned.map((pkg) => (
            <div key={pkg.slug}>
              <dt className="font-mono font-medium">
                {pkg.name} <span className="text-fd-muted-foreground">— planned</span>
              </dt>
              <dd className="mt-1 text-fd-muted-foreground">{pkg.summary}</dd>
            </div>
          ))}
        </dl>
      )}
    </>
  );
}
