# axonpack-docs

The documentation site for the `@axonpack/*` libraries, served at
[axonpack.github.io/docs](https://axonpack.github.io/docs).

[Next.js](https://nextjs.org) + [Fumadocs](https://fumadocs.dev), built as a **static export**. Pages
are MDX under `content/docs`.

## Where this repo lives

This is `axonpack/docs`, a repository of its own. It is also mounted into the
[axonpack monorepo](https://github.com/axonpack/axonpack) as a git submodule at `docs/`, beside the
code it describes and alongside `marketing/`, which is mounted the same way.

That mount is a convenience, not a coupling. **This project is self-contained** — its own lockfile,
its own `node_modules`, its own oxlint config, no dependency on any workspace package over there — and
it builds identically whether cloned on its own or checked out inside the monorepo.

Two consequences of being a submodule, both the same ones `marketing/` already has:

- A docs change is two commits: one here, and one in the monorepo to move the pointer.
- The monorepo's root `bun install`, `format`, `lint` and `build` do not reach in here. Run them from
  this directory.

## Running it

From **this** directory, not the monorepo root:

```sh
bun install
```

## One folder per package, everywhere

This site documents several independent libraries, not one product with several sections. So the
**package is the top-level axis**, and its slug is repeated identically in every place that holds
something belonging to it:

| Path                   | Holds                                               |
| ---------------------- | --------------------------------------------------- |
| `content/docs/<slug>/` | That package's pages, and only that package's       |
| `public/<slug>/`       | That package's screenshots and other assets         |
| `/docs/<slug>/...`     | Its routes                                          |
| `src/lib/packages.ts`  | One entry per package — name, slug, status, summary |

Nothing is shared between two libraries by accident, and a package can be removed by deleting one
folder in each column. The one page that belongs to no package is `content/docs/index.mdx`, the
introduction, which is the site's front page.

### Adding a library

1. Add an entry to `src/lib/packages.ts` with `status: 'shipped'`. The introduction, the nav and the
   `<PackageCards />` component all read from there — no second list to update.
2. Create `content/docs/<slug>/meta.json` with `"root": true`, a `title` of the full npm name, a
   one-line `description` and an `icon`, then list the folder in `content/docs/meta.json`.
3. Create `content/docs/<slug>/index.mdx` as the package overview, and list every page in `meta.json`.
4. Put its images under `public/<slug>/`.

Copy the shape of `content/docs/expo-devtools/` — `---Get started---` / `---Guides---` /
`---Shipping---` separators, then a `reference/` subfolder that collapses in the sidebar.

**This site documents only what is published.** A planned package gets no entry in `packages.ts`, no
folder, no card and no mention — it earns those on the day it goes to npm. Documentation is a promise
that something works as described, and a page for a package nobody can install is a promise with
nothing behind it. Unshipped work belongs in the monorepo's `notes/plan.md`.

## Where the rest lives

| Path                     | What is in it                                                        |
| ------------------------ | -------------------------------------------------------------------- |
| `content/docs/meta.json` | The tab order.                                                       |
| `*/meta.json`            | The sidebar. **A page not listed there does not appear.**            |
| `content/docs/index.mdx` | The introduction, which is the site's front page.                    |
| `src/lib/shared.ts`      | Site name, GitHub coordinates, and the llms.txt / OG route prefixes. |
| `src/components/mdx.tsx` | Every component an `.mdx` page may use without importing it.         |

## Deployment

`.github/workflows/deploy.yml` builds on every pull request and deploys to GitHub Pages on push to
`main`, using this repository's own `GITHUB_TOKEN`. **There is no secret to configure and no
credential to rotate** — which is the whole reason the site lives in the repo it is served from. A
cross-repo push would need a deploy key or a token, and both were tried and thrown away.

The only setup, once: Settings → Pages → Build and deployment → Source: **GitHub Actions**.

`public/.nojekyll` has to stay, or Pages runs Jekyll and drops every directory starting with an
underscore — including `_next`.

### Why the routes sit at the site root

GitHub Pages serves a project site under `/<repo>`, and this repo is named `docs`, so everything is
already under `https://axonpack.github.io/docs`. The app's own routes are therefore at _its_ root —
the introduction at `/`, a package at `/<slug>` — because a second `/docs` segment would only double
the prefix:

```
https://axonpack.github.io/docs/                          the introduction
https://axonpack.github.io/docs/expo-devtools/            a package
https://axonpack.github.io/docs/expo-devtools/network/    a page
```

`NEXT_PUBLIC_BASE_PATH` carries that prefix, set by the workflow from the repo name; local dev runs
without it. **Two places consume it and only one is automatic:**

- `next.config.mjs` passes it to `basePath`, which prefixes every route, link and asset.
- `src/components/search.tsx` builds the search index URL from it by hand. Fumadocs reads its own base
  path from `import.meta.env.BASE_URL`, a Vite convention Next does not set, so without this the index
  would be fetched from the domain root and every search would come back empty.

**To move to a custom domain**, drop both `NEXT_PUBLIC_*` variables from the workflow and add
`public/CNAME`. The routes are already at the root, so nothing else changes.

## Images

**Import an image, never reference it by path.** `next/image` does not apply `basePath` to a plain
string `src` when `images.unoptimized` is on — which it must be for a static export — so a string
resolves against the domain root and 404s under `/docs`. A static import (or a markdown `![]()`,
which fumadocs turns into one) is hashed into `/_next/static/media/` with the prefix applied.

`src/lib/shared.ts` exports `withBasePath()` for the few places that need the prefix applied by hand.
Knowing which those are matters, because getting it wrong in either direction 404s:

| URL                                           | Prefixed by | Why                                                                                                                  |
| --------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------- |
| `metadata.icons` (favicon)                    | **us**      | Next does not prefix metadata icon paths.                                                                            |
| the search index, `src/components/search.tsx` | **us**      | `staticClient` prefixes only its _default_ endpoint; an explicit `from` is used verbatim.                            |
| `getPageMarkdownUrl`                          | fumadocs    | Its page actions run the URL through their own `withBasePath` before fetching or linking it.                         |
| `getPageImageUrl`                             | Next        | It only reaches `metadata.openGraph.images`, resolved against `metadataBase`, whose path already carries the prefix. |

Next defines `import.meta.env.BASE_URL` from `basePath`, which is what fumadocs reads — so anything
that goes through a fumadocs component is already handled, and prefixing it again yields
`/docs/docs/...`.

**Known gap:** the popover's _Open in ChatGPT_ / _Open in Claude_ items build their URL from
`usePathname()` inside fumadocs, which strips the base path, so they point one level too high. It is
not reachable from props — fixing it means replacing the popover.

## Conventions

Borrowed from how Expo writes its own docs, because they hold up:

- **Sentence case headings.** Product names keep their capitals; nothing else does.
- **Register every new page** in the `meta.json` of its folder, in the position you want it in the
  sidebar. `---Label---` entries are section separators.
- **Frontmatter is `title` plus `description`.** `title` is both the page's H1 and its sidebar label,
  so keep it short enough to read in a 250px column. The description is the page subtitle, the OG
  image subtitle and the search snippet, so write it as a sentence about the page.
- **Follow the sibling.** A new page in a `reference/` folder should read like the one next to it.
- **Every claim comes from the source**, not from another document. The package's `README.md` and
  `REFERENCE.md` were the starting point for this content, and both had drifted from the code in
  places.
- **State the limits.** Each guide ends with what the thing cannot do, and why. That is a feature of
  this project's writing, not a disclaimer to trim.

Prettier is configured here (`.prettierrc`) to match the scaffold's style, so the repo's root `format`
task does not rewrite it. It does not reach `.mdx` at all — the root glob is `**/*.{ts,tsx,md}`.
