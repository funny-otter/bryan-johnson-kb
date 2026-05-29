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
    assert.doesNotMatch(source, /<span>BUCKET<\/span>/, 'protocol pages must not render one combined bucket table');
    assert.doesNotMatch(source, /ledgerRows/, 'component should not mix HBT/LNG/DNT rows into one ledger collection');
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
