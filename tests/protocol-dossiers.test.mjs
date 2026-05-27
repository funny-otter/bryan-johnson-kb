import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const protocolComponentPath = new URL('../src/components/ProtocolDossier.astro', import.meta.url);
const aliasRoutePath = new URL('../src/pages/protocols/[category].astro', import.meta.url);
const stylesPath = new URL('../src/styles/global.css', import.meta.url);
const categoryRoutes = ['health', 'longevity', 'nutrition', 'sleep'];

function read(url) {
  return readFileSync(url, 'utf8');
}

describe('protocol terminal dossier pages', () => {
  it('has a shared ledger-first dossier component instead of per-page hero/card grids', () => {
    assert.ok(existsSync(protocolComponentPath), 'missing shared ProtocolDossier component');
    const source = read(protocolComponentPath);

    assert.match(source, /protocol-dossier/, 'component should render the compact dossier shell');
    assert.match(source, /protocol-command/, 'component should include a compact command header');
    assert.match(source, /protocol-ledger/, 'component should render a table-like protocol ledger');
    assert.match(source, /protocol-dossier-side/, 'component should render right-side analysis panels');

    for (const label of ['Habits', 'Longterm', 'Don’ts']) {
      assert.match(source, new RegExp(label), `dossier should expose ${label} as a primary ledger bucket`);
    }
    for (const label of ['BUCKET', 'DIRECTIVE', 'CONFIDENCE', 'SOURCE']) {
      assert.match(source, new RegExp(`<span>${label}<\\/span>`), `ledger should include ${label} column`);
    }
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

  it('styles protocol pages like the BJ.WATCH terminal reference', () => {
    const styles = read(stylesPath);
    for (const selector of [
      '.protocol-dossier-grid',
      '.protocol-command',
      '.protocol-filter-row',
      '.protocol-ledger-labels',
      '.protocol-ledger-row',
      '.protocol-dossier-side',
      '.protocol-analysis-panel',
    ]) {
      assert.match(styles, new RegExp(selector.replace('.', '\\.')), `missing terminal dossier style ${selector}`);
    }
    assert.match(styles, /\.protocol-page h1\s*\{[^}]*font-size:\s*15px/s, 'protocol title should be compact, not a giant marketing hero');
    assert.doesNotMatch(styles, /\.protocol-card[\s\S]*border-radius:\s*2[0-9]px/, 'protocol primary surfaces should not use rounded generic card styling');
  });
});
