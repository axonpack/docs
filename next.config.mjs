import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

// This directory is the whole project — its own repository, mounted into the axonpack monorepo as a
// submodule at `docs/`. Pinning Turbopack's root here stops it inferring one from a lockfile further
// up when it is checked out inside that monorepo.
const projectRoot = import.meta.dirname;

// GitHub Pages serves a project site under `/<repo>`, and this repo is named `docs`, so the whole
// site sits at https://axonpack.github.io/docs. The app's own routes are therefore at *its* root —
// a second /docs segment would only double the prefix. The deploy workflow sets this; local dev and
// previews run without it. Two places consume it: `basePath` below, and the search index URL in
// `src/components/search.tsx`, which fumadocs cannot work out for itself.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  basePath,
  // Pages resolves `/foo/` to `/foo/index.html`. Without this, export writes `foo.html`, which works
  // on Pages but breaks any host that doesn't guess the extension.
  trailingSlash: true,
  // There is no server to optimise images on.
  images: { unoptimized: true },
  reactStrictMode: true,
  turbopack: { root: projectRoot },
  outputFileTracingRoot: projectRoot,
};

export default withMDX(config);
