import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import { protocolCategories } from '../src/data/protocols.mjs';

const protocolComponentPath = new URL('../src/components/ProtocolDossier.astro', import.meta.url);
const aliasRoutePath = new URL('../src/pages/protocols/[category].astro', import.meta.url);
const stylesPath = new URL('../src/styles/global.css', import.meta.url);
const categoryRoutes = ['health', 'longevity', 'nutrition', 'sleep'];
const root = fileURLToPath(new URL('..', import.meta.url));

function read(url) {
  return readFileSync(url, 'utf8');
}

function buildProtocolPages() {
  const result = spawnSync('npm', ['run', 'build'], {
    cwd: root,
    encoding: 'utf8',
  });

  assert.equal(
    result.status,
    0,
    `protocol integration build failed:\n${result.stdout}\n${result.stderr}`,
  );
}

function assertRenderedClaimSource(html, claimFragment, expectedSource) {
  const claimIndex = html.indexOf(claimFragment);
  assert.notEqual(claimIndex, -1, `missing rendered claim: ${claimFragment}`);

  const rowStart = html.lastIndexOf('<div class="obj"', claimIndex);
  const rowEnd = html.indexOf('</div>', claimIndex);
  assert.notEqual(rowStart, -1, `missing objective row for: ${claimFragment}`);
  assert.notEqual(rowEnd, -1, `unterminated objective row for: ${claimFragment}`);

  const row = html.slice(rowStart, rowEnd);
  assert.ok(
    row.includes(`<small>${expectedSource}</small>`),
    `claim must render beside ${expectedSource}; rendered row was: ${row}`,
  );
}

describe('protocol terminal dossier pages', () => {
  it('uses separate BJ.WATCH habit/objective/forbidden surfaces instead of one mixed bucket ledger', () => {
    assert.ok(existsSync(protocolComponentPath), 'missing shared ProtocolDossier component');
    const source = read(protocolComponentPath);

    assert.match(source, /protocol-dossier/, 'component should render the compact dossier shell');
    assert.match(source, /protocol-command/, 'component should include a compact command header');
    assert.match(source, /class="habit-list"/, 'daily habits should render in the reference habit-list table');
    assert.match(source, /class="habit-head"/, 'habit list should include the reference habit-head row');
    assert.match(source, /class="habit"/, 'habit entries should use the reference habit row class');
    assert.match(source, /class="two"/, 'objectives and forbidden items should sit in the reference two-column grid');
    assert.match(source, /class="panel objectives-panel"/, 'long-term objectives should render as a dedicated panel');
    assert.match(source, /class="panel forbidden-panel"/, 'forbidden items should render as a dedicated panel');
    assert.match(source, /class="obj"/, 'long-term objective rows should use the reference obj class');
    assert.match(source, /class="dont"/, 'forbidden rows should use the reference dont class');

    for (const label of ['idx', 'time', 'habit']) {
      assert.match(source, new RegExp(`<span>${label}<\\/span>`), `habit table should include ${label} header`);
    }
    assert.match(source, /Long-term objectives/, 'dossier should title the objectives panel exactly like the reference');
    assert.match(source, /Forbidden/, 'dossier should title the forbidden panel exactly like the reference');
    assert.match(source, /FORBID/, 'forbidden rows should use the compact FORBID label');
    assert.match(source, /dont-copy[\s\S]*row\.source/, 'forbidden rows should name their exact item source');
    assert.doesNotMatch(source, /<span>BUCKET<\/span>/, 'protocol pages must not render one combined bucket table');
    assert.doesNotMatch(source, /ledgerRows/, 'component should not mix HBT/LNG/DNT rows into one ledger collection');
    assert.doesNotMatch(source, /sourceFor|index\s*%\s*protocol\.sourcePaths/, 'source attribution must never depend on row position');
  });

  it('canonical protocol routes delegate to the dossier component and avoid the old card wall', () => {
    for (const category of categoryRoutes) {
      const pagePath = new URL(`../src/pages/${category}/index.astro`, import.meta.url);
      const source = read(pagePath);
      assert.match(source, /<ProtocolDossier/, `${category} route should render ProtocolDossier`);
      assert.doesNotMatch(source, /<ProtocolSections/, `${category} route should not render old section-card component`);
      assert.doesNotMatch(source, /class="protocol-grid"/, `${category} route should not put a card grid in the first viewport`);
    }
  });

  it('supports /protocols/[category]/ aliases for every protocol category', () => {
    assert.ok(existsSync(aliasRoutePath), 'missing dynamic /protocols/[category]/ route');
    const source = read(aliasRoutePath);
    assert.match(source, /getStaticPaths/, 'alias route should statically enumerate protocol categories');
    assert.match(source, /<ProtocolDossier/, 'alias route should render the same protocol dossier page');
    for (const category of categoryRoutes) {
      assert.match(source, new RegExp(category), `alias route should include ${category}`);
    }
  });

  it('requires an explicit source on every habit, objective, and forbidden item', () => {
    for (const protocol of protocolCategories) {
      const itemSources = [];

      for (const section of ['habits', 'longterm', 'donts']) {
        assert.ok(Array.isArray(protocol.sections[section]), `${protocol.category}.${section} must be an array`);

        for (const [index, item] of protocol.sections[section].entries()) {
          assert.equal(typeof item, 'object', `${protocol.category}.${section}[${index}] must use the explicit source contract`);
          assert.match(item.text, /\S/, `${protocol.category}.${section}[${index}] must include claim text`);
          assert.match(item.source, /\S/, `${protocol.category}.${section}[${index}] must include an exact source path`);
          itemSources.push(item.source);
        }
      }

      assert.deepEqual(
        protocol.sourcePaths,
        [...new Set(itemSources)],
        `${protocol.category}.sourcePaths must be derived from its item-level sources`,
      );
    }
  });

  it('renders the July 20 health and longevity claims beside their exact July 21 raw source', () => {
    buildProtocolPages();

    const july21Source = 'raw/articles/bryan-johnson/x-twitter-daily-2026-07-21.md';
    const renderedHtml = Object.fromEntries(
      protocolCategories.map((protocol) => [
        protocol.category,
        read(new URL(`../dist/${protocol.category}/index.html`, import.meta.url)),
      ]),
    );

    for (const protocol of protocolCategories) {
      const itemCount = Object.values(protocol.sections).flat().length;
      const renderedSourceRows = renderedHtml[protocol.category].match(/data-source=/g) ?? [];
      assert.equal(renderedSourceRows.length, itemCount, `${protocol.category} must render one source-bearing row per protocol item`);

      for (const item of Object.values(protocol.sections).flat()) {
        assert.ok(
          renderedHtml[protocol.category].includes(`>${item.source}<`),
          `${protocol.category} must visibly name ${item.source}`,
        );
      }
    }

    assertRenderedClaimSource(
      renderedHtml.health,
      'Johnson shifted the dose question from minutes in the sauna',
      'raw/articles/bryan-johnson/x-twitter-daily-2026-06-17.md',
    );
    assertRenderedClaimSource(
      renderedHtml.health,
      'Treat the June 2026 inherited-cancer DNA + RNA panel',
      'raw/articles/bryan-johnson/x-twitter-daily-2026-06-26.md',
    );
    assertRenderedClaimSource(
      renderedHtml.health,
      'Treat the July 2026 eye-health thread as an organ-specific measurement agenda.',
      july21Source,
    );
    assertRenderedClaimSource(
      renderedHtml.longevity,
      'Classify daily Tadalafil/Cialis and similar drug claims',
      'raw/articles/bryan-johnson/x-twitter-daily-2026-06-13.md',
    );
    assertRenderedClaimSource(
      renderedHtml.longevity,
      'structural imaging may complement chemical and functional data',
      'raw/articles/bryan-johnson/x-twitter-daily-2026-06-24.md',
    );
    assertRenderedClaimSource(
      renderedHtml.longevity,
      'the “Bryan in a dish” ex-vivo model and candidate precision therapies',
      'raw/articles/bryan-johnson/x-twitter-daily-2026-07-09.md',
    );
    assertRenderedClaimSource(
      renderedHtml.longevity,
      'The disease and proposed research program are unspecified',
      july21Source,
    );
  });

  it('styles protocol pages like the BJ.WATCH terminal reference', () => {
    const styles = read(stylesPath);
    for (const selector of [
      '.protocol-dossier-grid',
      '.protocol-command',
      '.protocol-filter-row',
      '.habit-list',
      '.habit-head',
      '.habit',
      '.two',
      '.panel',
      '.obj',
      '.dont',
      '.protocol-dossier-side',
      '.protocol-analysis-panel',
    ]) {
      assert.match(styles, new RegExp(selector.replace('.', '\\.')), `missing terminal dossier style ${selector}`);
    }
    assert.match(styles, /\.protocol-page h1\s*\{[^}]*font-size:\s*15px/s, 'protocol title should be compact, not a giant marketing hero');
    assert.doesNotMatch(styles, /\.protocol-card[\s\S]*border-radius:\s*2[0-9]px/, 'protocol primary surfaces should not use rounded generic card styling');
  });
});
