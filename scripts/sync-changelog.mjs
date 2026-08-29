/**
 * Rebuilds `content/docs/expo-devtools/changelog.mdx` from the package's own CHANGELOG.md.
 *
 * The changelog is written by Changesets in the monorepo, and this site is a different repository —
 * so the page here is generated and committed rather than fetched at build time. A build that has to
 * reach GitHub to render a page fails whenever GitHub does, and a release only happens a few times a
 * month, which is exactly the cadence a manual `bun run sync:changelog` suits.
 *
 * Release dates come from the npm registry: Changesets does not record them, and the git tags that
 * would carry them are not reliably pushed.
 *
 * Usage: bun run sync:changelog
 */
import { readFile, writeFile } from 'node:fs/promises';

const PKG = '@axonpack/expo-devtools';
/**
 * This repository is mounted as a submodule at `docs/` inside the monorepo, so when you are working
 * there the package's changelog is on disk one level up. Read that first: it means a version bumped
 * locally shows on the site immediately, without waiting for the change to reach `main`.
 */
const LOCAL = new URL(`../../packages/${PKG}/CHANGELOG.md`, import.meta.url);
const REMOTE = `https://raw.githubusercontent.com/axonpack/axonpack/main/packages/${PKG}/CHANGELOG.md`;
const REGISTRY = `https://registry.npmjs.org/${PKG}`;
const OUT = new URL('../content/docs/expo-devtools/changelog.mdx', import.meta.url);
const OUT_DATA = new URL('../src/lib/releases.generated.ts', import.meta.url);

const get = async (url, as = 'text') => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return as === 'json' ? res.json() : res.text();
};

async function readChangelog() {
  try {
    const local = await readFile(LOCAL, 'utf8');
    console.log('source: ../packages (local checkout)');
    return local;
  } catch {
    console.log('source: raw.githubusercontent.com (main)');
    return get(REMOTE);
  }
}

/**
 * Only the release dates and the current version come from npm. Losing them costs a date on each
 * heading, which is not worth failing a local run over — offline, the page still regenerates.
 */
async function readRegistry() {
  try {
    return await get(REGISTRY, 'json');
  } catch (error) {
    console.warn(`npm registry unavailable (${error.message}) — dates omitted`);
    return null;
  }
}

const [markdown, registry] = await Promise.all([readChangelog(), readRegistry()]);

// `null` means we could not reach npm, which is not the same as a version being absent from it —
// saying "not yet published" because the network was down would put a false claim on the page.
const known = registry !== null;
const dates = registry?.time ?? {};
const fmtDate = (v) =>
  dates[v]
    ? new Date(dates[v]).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

/** Changesets emits `- <sha>: <text>` with any further bullets indented under it. */
const stripCommitPrefix = (line) => line.replace(/^- [0-9a-f]{7,40}: (?:- )?/, '- ');
const dedent = (line) => (line.startsWith('  - ') ? line.slice(2) : line);

const releases = [];
let current = null;
for (const raw of markdown.split('\n')) {
  const version = raw.match(/^## (\d+\.\d+\.\d+.*)$/);
  if (version) {
    current = { version: version[1].trim(), sections: [] };
    releases.push(current);
    continue;
  }
  if (!current) continue; // the file's own H1
  const section = raw.match(/^### (Major|Minor|Patch) Changes$/);
  if (section) {
    current.sections.push({ bump: section[1], lines: [] });
    continue;
  }
  const section_ = current.sections.at(-1);
  if (section_) section_.lines.push(dedent(stripCommitPrefix(raw)));
}

const body = releases
  .map((r) => {
    const date = fmtDate(r.version);
    const bumps = r.sections.map((s) => s.bump.toLowerCase());
    // A version can be in CHANGELOG.md before it reaches npm: `changeset version` writes the entry,
    // `changeset publish` does the publishing. Until then there is no date and no page to link to, so
    // say that rather than linking somewhere that 404s.
    const published = Boolean(dates[r.version]);
    const meta = [
      published ? date : known ? 'not yet published' : null,
      bumps.length ? `${[...new Set(bumps)].join(' and ')} release` : null,
      published ? `[on npm](https://www.npmjs.com/package/${PKG}/v/${r.version})` : null,
    ]
      .filter(Boolean)
      .join(' · ');

    // The bump is already on the meta line; repeating it as a heading only adds noise when a
    // release has one kind of change, which nearly all of them do.
    const showHeadings = r.sections.length > 1;
    const sections = r.sections
      .map((s) => {
        const text = s.lines.join('\n').trim();
        return showHeadings ? `### ${s.bump} changes\n\n${text}` : text;
      })
      .join('\n\n');

    return `## ${r.version}\n\n${meta}\n\n${sections}`;
  })
  .join('\n\n');

const page = `---
title: Changelog
description: Every published release of @axonpack/expo-devtools, newest first.
---

{/* Generated by scripts/sync-changelog.mjs from the package's CHANGELOG.md — do not edit by hand. */}

Every published release, newest first.${
  registry?.['dist-tags']?.latest ? ` The current version is **${registry['dist-tags'].latest}**.` : ''
}

${body}
`;

await writeFile(OUT, page);

// The pages that advertise the current version read it from here, so a badge cannot drift from the
// changelog it links to — both come out of the same sync.
const latest = registry?.['dist-tags']?.latest;
// Without a version there is nothing truthful to put on the badge, so leave the last good file alone.
if (!latest) {
  console.warn('no latest version from npm — leaving releases.generated.ts untouched');
}
if (latest)
  await writeFile(
    OUT_DATA,
    `// Generated by scripts/sync-changelog.mjs — do not edit by hand.
export const releases: Record<string, { version: string; date: string }> = {
  'expo-devtools': { version: '${latest}', date: '${fmtDate(latest)}' },
};
`,
  );

console.log(
  `wrote ${releases.length} releases to content/docs/expo-devtools/changelog.mdx` +
    (latest ? ` (latest ${latest})` : ''),
);
