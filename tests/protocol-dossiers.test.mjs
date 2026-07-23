import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { before, describe, it } from 'node:test';

import { protocolCategories, protocolSectionsBySlug } from '../src/data/protocols.mjs';

const protocolComponentPath = new URL('../src/components/ProtocolDossier.astro', import.meta.url);
const aliasRoutePath = new URL('../src/pages/protocols/[category].astro', import.meta.url);
const stylesPath = new URL('../src/styles/global.css', import.meta.url);
const categoryRoutes = ['health', 'longevity', 'nutrition', 'sleep'];
const sectionKeys = ['habits', 'longterm', 'donts'];
const dossierRowClasses = {
  habits: 'habit',
  longterm: 'obj',
  donts: 'dont',
};
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

function decodeHtml(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#([0-9]+);/g, (_match, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&(amp|apos|gt|lt|quot);/g, (_match, entity) => ({
      amp: '&',
      apos: "'",
      gt: '>',
      lt: '<',
      quot: '"',
    })[entity]);
}

function parseAttributes(source) {
  const attributes = {};
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

  for (const match of source.matchAll(pattern)) {
    attributes[match[1]] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? '');
  }

  return attributes;
}

function extractElements(html, tagName) {
  const pattern = new RegExp(`<\\/?${tagName}\\b([^>]*)>`, 'gi');
  const stack = [];
  const elements = [];

  for (const match of html.matchAll(pattern)) {
    if (match[0].startsWith('</')) {
      const opening = stack.pop();
      assert.ok(opening, `unexpected closing <${tagName}> tag`);
      elements.push({
        attributes: opening.attributes,
        innerHtml: html.slice(opening.contentStart, match.index),
        start: opening.start,
      });
    } else if (!match[0].endsWith('/>')) {
      stack.push({
        attributes: parseAttributes(match[1]),
        contentStart: match.index + match[0].length,
        start: match.index,
      });
    }
  }

  assert.equal(stack.length, 0, `unterminated <${tagName}> tag`);
  return elements.sort((left, right) => left.start - right.start);
}

function hasClass(element, className) {
  return (element.attributes.class ?? '').split(/\s+/).includes(className);
}

function renderedText(html) {
  return decodeHtml(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function singleElementText(html, tagName, predicate, label) {
  const matches = extractElements(html, tagName).filter(predicate);
  assert.equal(matches.length, 1, `${label} must contain exactly one matching <${tagName}>`);
  return renderedText(matches[0].innerHtml);
}

function renderedObjectiveClaim(item) {
  const [_rawTarget, ...rest] = item.text.split(/—|:|;/);
  return rest.length ? rest.join('—').trim() : item.text;
}

function extractDossierSectionRows(html, sectionKey) {
  const rowClass = dossierRowClasses[sectionKey];
  const rows = extractElements(html, 'div').filter((element) => hasClass(element, rowClass));

  return rows.map((row, index) => {
    const claim = sectionKey === 'habits'
      ? singleElementText(row.innerHtml, 'strong', (element) => hasClass(element, 'h-title'), `${sectionKey}[${index}]`)
      : sectionKey === 'longterm'
        ? singleElementText(row.innerHtml, 'strong', () => true, `${sectionKey}[${index}]`)
        : singleElementText(row.innerHtml, 'span', (element) => !element.attributes.class, `${sectionKey}[${index}]`);
    const sourceTag = sectionKey === 'habits' ? 'code' : 'small';
    const visibleSource = singleElementText(row.innerHtml, sourceTag, () => true, `${sectionKey}[${index}] source`);

    return {
      claim,
      source: row.attributes['data-source'],
      visibleSource,
    };
  });
}

function assertDossierSourcePairs(html, protocol, surface) {
  for (const sectionKey of sectionKeys) {
    const expected = protocol.sections[sectionKey].map((item) => ({
      claim: sectionKey === 'longterm' ? renderedObjectiveClaim(item) : item.text,
      source: item.source,
      visibleSource: item.source,
    }));

    assert.deepEqual(
      extractDossierSectionRows(html, sectionKey),
      expected,
      `${surface} must preserve every ${sectionKey} claim/source pair in source order`,
    );
  }
}

function extractKnowledgeSectionRows(html, sectionKey) {
  const buckets = extractElements(html, 'article').filter((element) => hasClass(element, `bucket-${sectionKey}`));
  assert.equal(buckets.length, 1, `knowledge page must render exactly one ${sectionKey} bucket`);

  return extractElements(buckets[0].innerHtml, 'li').map((row, index) => {
    const sourceStart = row.innerHtml.search(/<small\b/i);
    assert.notEqual(sourceStart, -1, `${sectionKey}[${index}] must visibly render its source`);
    const source = singleElementText(row.innerHtml, 'code', () => true, `${sectionKey}[${index}] source`);

    return {
      claim: renderedText(row.innerHtml.slice(0, sourceStart)),
      source,
    };
  });
}

function assertKnowledgeSourcePairs(html, sections, surface) {
  for (const sectionKey of sectionKeys) {
    const expected = sections[sectionKey].map(({ text: claim, source }) => ({ claim, source }));
    assert.deepEqual(
      extractKnowledgeSectionRows(html, sectionKey),
      expected,
      `${surface} must preserve every ${sectionKey} claim/source pair in source order`,
    );
  }
}

function swapRenderedSources(html, firstSource, secondSource) {
  const placeholder = '__PROTOCOL_SOURCE_PERMUTATION_MUTANT__';
  assert.ok(html.includes(firstSource), `mutant fixture is missing ${firstSource}`);
  assert.ok(html.includes(secondSource), `mutant fixture is missing ${secondSource}`);
  assert.ok(!html.includes(placeholder), 'mutant placeholder must be unique');
  return html
    .replaceAll(firstSource, placeholder)
    .replaceAll(secondSource, firstSource)
    .replaceAll(placeholder, secondSource);
}

function assertLegacyDossierChecksStillPass(html, protocol) {
  const itemCount = Object.values(protocol.sections).flat().length;
  assert.equal(html.match(/data-source=/g)?.length ?? 0, itemCount);
  for (const item of Object.values(protocol.sections).flat()) {
    assert.ok(html.includes(`>${item.source}<`), `legacy presence control must still find ${item.source}`);
  }
}

function assertRenderedClaimSource(html, claimFragment, expectedSource) {
  const row = extractDossierSectionRows(html, 'longterm')
    .find(({ claim }) => claim.includes(claimFragment));
  assert.ok(row, `missing rendered objective claim: ${claimFragment}`);
  assert.equal(row.source, expectedSource, `${claimFragment} must keep its source attribute`);
  assert.equal(row.visibleSource, expectedSource, `${claimFragment} must visibly name its exact source`);
}

function assertRenderedHabitSource(html, claimFragment, expectedSource) {
  const row = extractDossierSectionRows(html, 'habits')
    .find(({ claim }) => claim.includes(claimFragment));
  assert.ok(row, `missing rendered habit: ${claimFragment}`);
  assert.equal(row.source, expectedSource, `${claimFragment} must keep its source attribute`);
  assert.equal(row.visibleSource, expectedSource, `${claimFragment} must visibly name its exact source`);
}

describe('protocol terminal dossier pages', () => {
  before(() => buildProtocolPages());

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

  it('renders every canonical dossier and knowledge-page claim beside its exact item source', () => {
    const renderedHtml = Object.fromEntries(
      protocolCategories.map((protocol) => [
        protocol.category,
        read(new URL(`../dist/${protocol.category}/index.html`, import.meta.url)),
      ]),
    );

    for (const protocol of protocolCategories) {
      assertDossierSourcePairs(renderedHtml[protocol.category], protocol, `/${protocol.category}/`);
      assert.ok(
        existsSync(new URL(`../dist/protocols/${protocol.category}/index.html`, import.meta.url)),
        `/protocols/${protocol.category}/ alias must remain part of the generated build`,
      );
    }

    for (const [slug, sections] of Object.entries(protocolSectionsBySlug)) {
      assert.ok(sections, `${slug} must resolve to protocol sections`);
      const html = read(new URL(`../dist/knowledge/${slug}/index.html`, import.meta.url));
      assertKnowledgeSourcePairs(html, sections, `/knowledge/${slug}/`);
    }
  });

  it('rejects source permutations that the former global-presence checks allowed', () => {
    const protocol = protocolCategories.find(({ category }) => category === 'nutrition');
    assert.ok(protocol, 'nutrition protocol must exist for the permutation fixture');
    const firstSource = protocol.sections.longterm[0].source;
    const secondSource = protocol.sections.donts[1].source;

    const dossierHtml = read(new URL('../dist/nutrition/index.html', import.meta.url));
    const dossierMutant = swapRenderedSources(dossierHtml, firstSource, secondSource);
    assertLegacyDossierChecksStillPass(dossierMutant, protocol);
    assert.throws(
      () => assertDossierSourcePairs(dossierMutant, protocol, '/nutrition/ permutation mutant'),
      assert.AssertionError,
      'row-level dossier assertions must fail when two declared sources trade positions',
    );
    assertDossierSourcePairs(dossierHtml, protocol, '/nutrition/ explicit-source implementation');

    const knowledgeHtml = read(new URL('../dist/knowledge/blueprint/index.html', import.meta.url));
    const knowledgeMutant = swapRenderedSources(knowledgeHtml, firstSource, secondSource);
    for (const item of Object.values(protocol.sections).flat()) {
      assert.ok(knowledgeMutant.includes(`>${item.source}<`), `presence control must still find ${item.source}`);
    }
    assert.throws(
      () => assertKnowledgeSourcePairs(knowledgeMutant, protocol.sections, '/knowledge/blueprint/ permutation mutant'),
      assert.AssertionError,
      'row-level knowledge assertions must fail when two declared sources trade positions',
    );
    assertKnowledgeSourcePairs(knowledgeHtml, protocol.sections, '/knowledge/blueprint/ explicit-source implementation');
  });

  it('keeps audited GLP-1, eye tear-panel, disease-resolution, and bedtime claims on their exact sources', () => {
    const july21Source = 'raw/articles/bryan-johnson/x-twitter-daily-2026-07-21.md';
    const july22Source = 'raw/articles/bryan-johnson/x-twitter-daily-2026-07-22.md';
    const july23Source = 'raw/articles/bryan-johnson/x-twitter-daily-2026-07-23.md';
    const healthHtml = read(new URL('../dist/health/index.html', import.meta.url));
    const longevityHtml = read(new URL('../dist/longevity/index.html', import.meta.url));
    const sleepHtml = read(new URL('../dist/sleep/index.html', import.meta.url));

    assertRenderedClaimSource(
      healthHtml,
      'Treat the July 2026 six-option GLP-1 catalog as an Immortals Rx commercial update.',
      july23Source,
    );
    assertRenderedClaimSource(
      longevityHtml,
      'Classify the July 2026 six-option GLP-1 catalog as a more specific commercial listing',
      july23Source,
    );
    assertRenderedClaimSource(
      healthHtml,
      'Treat the July 2026 ocular tear-panel post as an organ-specific measurement plan.',
      july22Source,
    );
    assertRenderedClaimSource(
      longevityHtml,
      'The disease and proposed research program are unspecified',
      july21Source,
    );
    assertRenderedClaimSource(
      longevityHtml,
      'autologous iPSC “clone” post as speculative regenerative-biotech positioning',
      july22Source,
    );
    assertRenderedHabitSource(
      sleepHtml,
      'go to bed on time',
      'raw/articles/bryan-johnson/x-twitter-bryan-johnson-2026-05-22.md#Thu May 21 13:59:33 +0000 2026',
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
