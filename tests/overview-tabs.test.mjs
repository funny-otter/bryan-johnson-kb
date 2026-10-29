import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const indexSource = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
const contentConfig = readFileSync(new URL('../src/content.config.ts', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
const changelogSource = readFileSync(new URL('../src/pages/changelog/index.astro', import.meta.url), 'utf8');
const baseLayoutSource = readFileSync(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
const curatedHomePath = new URL('../src/data/curated-home.mjs', import.meta.url);
const curatedHomeSource = existsSync(curatedHomePath) ? readFileSync(curatedHomePath, 'utf8') : '';
const signalsPath = new URL('../src/data/signals.mjs', import.meta.url);
const signalsSource = existsSync(signalsPath) ? readFileSync(signalsPath, 'utf8') : '';
const protocolsPath = new URL('../src/data/protocols.mjs', import.meta.url);
const protocolsSource = existsSync(protocolsPath) ? readFileSync(protocolsPath, 'utf8') : '';
const dashboardSectionsPath = new URL('../src/data/dashboard-sections.ts', import.meta.url);
const dashboardSectionsSource = existsSync(dashboardSectionsPath) ? readFileSync(dashboardSectionsPath, 'utf8') : '';
const algorithmicHealthPath = new URL('../src/content/knowledge/algorithmic-health.md', import.meta.url);
const algorithmicHealthSource = existsSync(algorithmicHealthPath) ? readFileSync(algorithmicHealthPath, 'utf8') : '';
const conceptsPagePath = new URL('../src/pages/concepts/index.astro', import.meta.url);
const conceptsPageSource = existsSync(conceptsPagePath) ? readFileSync(conceptsPagePath, 'utf8') : '';
const nutritionPagePath = new URL('../src/pages/nutrition/index.astro', import.meta.url);
const nutritionPageSource = existsSync(nutritionPagePath) ? readFileSync(nutritionPagePath, 'utf8') : '';
const sleepPagePath = new URL('../src/pages/sleep/index.astro', import.meta.url);
const sleepPageSource = existsSync(sleepPagePath) ? readFileSync(sleepPagePath, 'utf8') : '';
const knowledgeShellPath = new URL('../src/components/KnowledgePageShell.astro', import.meta.url);
const knowledgeShellSource = existsSync(knowledgeShellPath) ? readFileSync(knowledgeShellPath, 'utf8') : '';
const protocolSectionComponentPath = new URL('../src/components/ProtocolSections.astro', import.meta.url);
const protocolSectionComponentSource = existsSync(protocolSectionComponentPath) ? readFileSync(protocolSectionComponentPath, 'utf8') : '';

const protocolSectionLabels = ['Habits', 'Longterm', "Don’ts"];

describe('home overview and dedicated changelog route', () => {
  it('keeps update history off the terminal overview and exposes changelog through primary nav', () => {
    assert.doesNotMatch(indexSource, /getCollection\('updates'\)/, 'overview should not load update entries for an embedded changelog');
    assert.doesNotMatch(indexSource, /overview-tab-overview/, 'overview should not include an Overview tab control');
    assert.doesNotMatch(indexSource, /overview-tab-changelog/, 'overview should not include a Changelog tab control');
    assert.match(indexSource, /Latest signal/i, 'overview should lead with the terminal-style latest-signal surface');
    assert.match(indexSource, /signal-table-title/, 'overview should include an accessible latest-signal table heading');
    assert.match(baseLayoutSource, /\['\/changelog\/',\s*'changelog'/, 'primary navigation should link to the standalone changelog route');
    assert.match(baseLayoutSource, /navGroups/, 'primary navigation should expose the changelog route as its own top-level item');
    assert.match(changelogSource, /getCollection\('updates'\)/, 'changelog route should load update entries');
    assert.match(changelogSource, /<h1 id="changelog-title">Changelog<\/h1>/, 'changelog route should render update-history content');
    assert.match(contentConfig, /const updates = defineCollection/, 'content config should define an updates collection');
    assert.match(contentConfig, /collections = \{ knowledge, updates \}/, 'updates collection should be exported');
    assert.match(styles, /\.watch-board/, 'global styles should include the terminal overview board layout');
    assert.match(styles, /\.signal-terminal/, 'global styles should include latest-signal terminal table styles');
    assert.match(styles, /\.changelog-list/, 'global styles should include changelog list styles');
  });

  it('keeps the latest curated signal table high on the page with source-aware framing', () => {
    assert.ok(indexSource.indexOf('watch-board') < indexSource.indexOf('watch-lower'), 'terminal signal board should appear before lower reference paths');
    assert.match(indexSource, /<section class="signal-terminal" aria-labelledby="signal-table-title">/, 'latest signals should render as a terminal table surface');
    for (const label of ['DATE', 'TAG', 'CONTENT', 'SOURCES']) {
      assert.match(indexSource, new RegExp(`<span>${label}<\\/span>`), `signal table should include ${label} column label`);
    }
    assert.match(indexSource, /sourceLabel\(item\.sources\.length\)/, 'each signal row should show source count instead of engagement/update-history metadata');
    assert.match(indexSource, /source-aware summaries/, 'overview heading should frame summaries as source-aware');
    assert.match(indexSource, /source trails and medical caution visible|claims stay framed as Johnson's position rather than clinical advice/, 'overview copy should preserve medical caution framing');
    assert.match(baseLayoutSource, /not personal medical advice/, 'shared layout should preserve site-wide medical caution');
  });

  it('turns the desktop sidebar into an accessible mobile drawer and hides side panels on phones', () => {
    assert.match(baseLayoutSource, /button class="terminal-menu-toggle"/, 'layout should expose a hamburger button for mobile navigation');
    assert.match(baseLayoutSource, /aria-controls="terminal-sidebar"/, 'hamburger button should control the sidebar drawer');
    assert.match(baseLayoutSource, /aria-expanded="false"/, 'hamburger button should advertise its collapsed state by default');
    assert.match(baseLayoutSource, /id="terminal-sidebar"/, 'sidebar should be addressable by aria-controls');
    assert.match(baseLayoutSource, /terminal-drawer-backdrop/, 'layout should include a click-away backdrop for closing the drawer');
    assert.match(baseLayoutSource, /data-close-nav/, 'drawer should include explicit close affordances');
    assert.match(baseLayoutSource, /Escape/, 'drawer script should close on Escape');
    assert.match(styles, /@media \(max-width: 720px\)[\s\S]*\.terminal-sidebar[\s\S]*transform: translateX\(-100%\)/, 'mobile CSS should move the left sidebar off-canvas by default');
    assert.match(styles, /body\.nav-open[\s\S]*\.terminal-sidebar[\s\S]*transform: translateX\(0\)/, 'mobile CSS should slide the sidebar in when opened');
    assert.match(styles, /@media \(max-width: 720px\)[\s\S]*\.watch-side[\s\S]*display: none/, 'mobile CSS should hide the right analysis sidebar');
  });

  it('wires overview recent news to the curated high-signal set, not updated knowledge-page order', () => {
    assert.doesNotMatch(indexSource, /const recentNews\s*=\s*entries\.slice\(0,\s*3\)/, 'overview must not use generic recently-updated knowledge pages');
    assert.match(indexSource, /curatedRecentNews/, 'overview should render explicit curated recent-news cards');

    for (const phrase of [
      'Kate Tolo launches female-specific Blueprint measurement protocol',
      'Blueprint biomarker platform: 100+ biomarkers, AI action plan, retesting',
      'Microplastics become a Blueprint testing/product theme',
      'Blueprint starts certifying partner products',
      "Blueprint/Don't Die positioning",
    ]) {
      assert.match(curatedHomeSource, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `missing curated overview item: ${phrase}`);
    }
  });

  it('keeps background company biography out of concise overview core topics', () => {
    assert.match(indexSource, /coreTopicSlugs/, 'overview should choose explicit core topic slugs');
    assert.doesNotMatch(curatedHomeSource, /coreTopicSlugs[\s\S]*['"]braintree['"]/, 'Braintree should not be a concise overview core topic');
  });

  it('includes curated dated changelog rows, including the 2026-05-23 curation pass', () => {
    for (const file of [
      '../src/content/updates/2026-05-23-recent-news-changelog-curation-pass.md',
      '../src/content/updates/2026-05-22-blueprint-biomarkers-page-captured.md',
      '../src/content/updates/2026-04-20-years-critique-biomarker-limits.md',
      '../src/content/updates/2026-01-23-bryan-johnsons-protocol-dont-die-refresh.md',
      '../src/content/updates/2026-01-05-time-profile-longevity-critique.md',
    ]) {
      assert.ok(existsSync(new URL(file, import.meta.url)), `missing changelog update file: ${file}`);
    }
  });

  it('renders changelog as exactly two accessible tabs split by protocol versus site updates', () => {
    const tabInputMatches = changelogSource.match(/class="changelog-tab-input"/g) || [];
    assert.equal(tabInputMatches.length, 2, 'changelog should expose exactly two primary tab controls');
    assert.match(changelogSource, /role="tablist"/, 'changelog tabs should expose an accessible tablist');
    assert.match(changelogSource, /Protocol updates/, 'first tab should label Bryan\/Blueprint protocol changes');
    assert.match(changelogSource, /Site changelog/, 'second tab should label site\/wiki maintenance changes');
    assert.match(changelogSource, /const protocolUpdates\s*=/, 'protocol updates should be a dedicated data bucket');
    assert.match(changelogSource, /const siteChangelog\s*=/, 'site changelog should be a dedicated data bucket');
    assert.match(changelogSource, /data-tab-panel="protocol-updates"/, 'protocol tab panel should be addressable');
    assert.match(changelogSource, /data-tab-panel="site-changelog"/, 'site tab panel should be addressable');
    assert.match(changelogSource, /<ChangelogUpdateList\s+[\s\S]*updates=\{protocolUpdates\}/, 'protocol panel should render only protocol entries');
    assert.match(changelogSource, /<ChangelogUpdateList\s+[\s\S]*updates=\{siteChangelog\}/, 'site panel should render only site entries');
    assert.match(styles, /\.changelog-tabs/, 'global styles should include changelog-specific tab layout');
    assert.match(styles, /#changelog-tab-protocol:checked[\s\S]*data-tab-panel="protocol-updates"/, 'CSS should reveal protocol panel from tab state');
    assert.match(styles, /#changelog-tab-site:checked[\s\S]*data-tab-panel="site-changelog"/, 'CSS should reveal site panel from tab state');
  });

  it('matches the reference left-sidebar information architecture and order', () => {
    const expectedOrder = [
      "['/', 'overview'",
      "['/health/', 'health'",
      "['/longevity/', 'longevity'",
      "['/nutrition/', 'nutrition'",
      "['/sleep/', 'sleep'",
      "['/concepts/', 'concepts'",
      "['/metrics/', 'metrics'",
      "['/changelog/', 'changelog'",
    ];
    let cursor = -1;
    for (const marker of expectedOrder) {
      const next = baseLayoutSource.indexOf(marker);
      assert.ok(next > cursor, `sidebar item should appear after previous item: ${marker}`);
      cursor = next;
    }
    assert.match(baseLayoutSource, /label: 'FEED'[\s\S]*'overview'[\s\S]*label: 'PROTOCOLS'[\s\S]*'health'[\s\S]*'longevity'[\s\S]*'nutrition'[\s\S]*'sleep'[\s\S]*label: 'REFERENCE'[\s\S]*'concepts'[\s\S]*label: 'SIGNAL'[\s\S]*'metrics'[\s\S]*'changelog'/, 'sidebar groups should match reference labels and order');
    assert.doesNotMatch(baseLayoutSource, /\['\/search\/',\s*'search'/, 'reference sidebar should not include search in the primary reference IA');
  });

  it('surfaces llm-wiki X/Twitter material as source-aware dashboard signals', () => {
    assert.ok(existsSync(signalsPath), 'curated signals data file should exist');
    for (const required of [
      '2058671232002990136',
      '2058383135868666111',
      '2058227392024560022',
      '2057816322583728479',
      'x-twitter-daily-2026-05-25.md',
      'x-twitter-bryan-johnson-2026-05-22.md',
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `signals should cite ${required}`);
    }
    assert.match(indexSource, /curatedSignals/, 'overview should render curatedSignals rather than only generic curated cards');
    assert.match(indexSource, /Recent tweets\/signals/, 'right sidebar should include a recent tweets/signals panel');
    assert.doesNotMatch(indexSource, /Synthetic activity heatmap/i, 'activity panel must not identify itself as synthetic');
  });

  it('keeps the July 16 crosslink-reversal post in a low-confidence ex-vivo research-watch lane', () => {
    for (const required of [
      '2077789855434879292',
      'x-twitter-daily-2026-07-17.md',
      'unnamed laboratory result',
      'work remains ex vivo',
      'safe delivery of a large bacterial enzyme into living tissue is unresolved',
      'confidence: \'low\'',
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `crosslink research signal should preserve: ${required}`);
    }
  });

  it('keeps the July 20 disease-resolution pivot attributed and non-prescriptive', () => {
    for (const required of [
      '2079272175232827396',
      'x-twitter-daily-2026-07-21.md',
      'unspecified “incurable disease” diagnosis',
      'disease, research targets, tests, therapies, and outcomes were not named',
      'not named, independently validated, or offered as medical advice',
      'confidence: \'medium\'',
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `disease-resolution signal should preserve: ${required}`);
    }
  });

  it('keeps the July 21 iPSC and ocular tear-panel follow-ups bounded by the source evidence', () => {
    for (const required of [
      '2079672688034083030',
      '2079359268550283686',
      'x-twitter-daily-2026-07-22.md',
      'not evidence of a human clone',
      'No results, diagnosis, intervention, reference range, clinical-utility evidence, or outcome was published',
      'confidence: \'low\'',
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `July 21 follow-up signals should preserve: ${required}`);
    }
  });

  it('publishes the July 22 six-option GLP-1 catalog as attributed commercial positioning', () => {
    for (const required of [
      '2079987669594214556',
      'x-twitter-daily-2026-07-23.md',
      'six GLP-1 options',
      'Zepbound, Wegovy injections and tablets, Foundayo tablets, compounded tirzepatide, and compounded semaglutide',
      'not evidence that any option is safe or effective for longevity',
      'confidence: \'medium\'',
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `GLP-1 catalog signal should preserve: ${required}`);
    }
  });

  it('publishes the July 23 sauna checklist as attributed, non-prescriptive protocol positioning', () => {
    for (const required of [
      '2080377484793511959',
      'x-twitter-daily-2026-07-24.md',
      '4–7 dry-sauna sessions per week',
      'hydration, fertility, air-quality, and material cautions',
      'not a reader prescription or independent evidence of longevity benefit',
      'confidence: \'medium\'',
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `sauna checklist signal should preserve: ${required}`);
    }
  });

  it('publishes the July 24–25 Immortals and Kate Tolo updates with evidence boundaries', () => {
    for (const required of [
      '2080690740532019638',
      'x-twitter-daily-2026-07-25.md',
      'infrastructure for individuals to discover and resolve their own health issues',
      'not evidence that the platform can diagnose or cure disease',
      '2081098595378545131',
      'x-twitter-daily-2026-07-26.md',
      '14 million menstrual-cycle data points',
      '100+ daily tasks, 50+ devices, and a 12-person medical team',
      'not a completed dataset, general female-health protocol, or medical advice',
      'confidence: \'medium\'',
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `latest curated signals should preserve: ${required}`);
    }
  });

  it('publishes the July 28 aviation origin essay as bounded autobiographical context', () => {
    for (const required of [
      '2082234024001704356',
      'x-twitter-daily-2026-07-29.md',
      'flight training taught him to treat safety and performance as systems',
      'not evidence that the routine treats depression',
      'confidence: \'medium\'',
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `aviation origin signal should preserve: ${required}`);
    }
  });

  it('publishes the July 31 menstrual-blood sampling proposal with diagnostic boundaries', () => {
    for (const required of [
      '2083000689106772176',
      'x-twitter-daily-2026-08-02.md',
      'repeatable, non-invasive sample of the uterine environment',
      'publishes no assay method or result',
      'not a validated diagnostic test, established substitute for biopsy, general protocol, or medical advice',
      "confidence: 'low'",
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `menstrual-blood signal should preserve: ${required}`);
    }
  });

  it('publishes the August 3 Viagra/statin cancer claim without turning it into treatment guidance', () => {
    for (const required of [
      '2084315644338835803',
      'x-twitter-daily-2026-08-04.md',
      'Viagra plus statins may blunt cancer spread',
      'study is preclinical and the human evidence is observational',
      'not evidence that sildenafil, tadalafil, or statins prevent metastasis',
      "confidence: 'low'",
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `Viagra/statin signal should preserve: ${required}`);
    }
  });

  it('publishes the August 4 Kate Tolo build comparison as an operational claim, not clinical proof', () => {
    for (const required of [
      '2084681696205766914',
      'x-twitter-daily-2026-08-05.md',
      'own longevity infrastructure took five years',
      'built Kate Tolo’s female-health protocol in 90 days',
      'did not define “better,” publish comparative measurements, or report clinical outcomes',
      'not evidence that Tolo’s protocol is clinically superior',
      "confidence: 'low'",
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `Kate Tolo build-comparison signal should preserve: ${required}`);
    }
  });

  it('publishes the August 12–13 measurement and brain-clearance posts with evidence boundaries', () => {
    for (const required of [
      '2087620254797320493',
      '2087974099926831116',
      '2087979402831507514',
      'x-twitter-daily-2026-08-13.md',
      'x-twitter-daily-2026-08-14.md',
      '47-tube, 250 mL blood draw',
      'brain, skin, strength, balance, reaction-speed, and mobility tests',
      'Neither post supplied results or test-validity evidence',
      'unnamed mouse study',
      'no paper, human data, or translational safety evidence',
      'not a Blueprint intervention, demonstrated human therapy, or medical advice',
      "confidence: 'low'",
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `August measurement/research signals should preserve: ${required}`);
    }

    assert.match(protocolsSource, /47-tube, 250 mL blood draw[\s\S]*no assay list, results, diagnosis, clinical interpretation/, 'protocol guidance should keep the blood draw in the scale-and-methods lane');
    assert.match(protocolsSource, /brain-clearance post as an uncited, preclinical research lead[\s\S]*no named paper, human evidence, translational safety data/, 'longevity guidance should keep the brain-clearance post preclinical');
  });

  it('publishes the August 16 food-discipline post as attributed behavior framing, not a clinical judgment', () => {
    for (const required of [
      '2089036111545000149',
      'x-twitter-daily-2026-08-17.md',
      'accountable to biomarkers',
      'quest can become unhealthy',
      'personal self-description',
      'not a clinical diagnosis',
      "confidence: 'medium'",
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `food-discipline signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /dietary control[\s\S]*biomarker-governed[\s\S]*clinical assessment/i, 'opinion context should preserve both Johnson’s position and the clinical boundary');
    assert.match(algorithmicHealthSource, /August 16[\s\S]*changes his food protocol according to data[\s\S]*does not establish clinical appropriateness/i, 'algorithmic-health context should preserve the decision-loop signal and its limit');
  });

  it('publishes the August 18–19 eye-health and mRNA posts as attributed N=1 and research-watch claims', () => {
    for (const required of [
      '2089822905891000605',
      '2090212567235149828',
      '2089802500765548788',
      'https://x.com/bryan_johnson/status/2089822905891000605',
      'meibomian-gland dysfunction',
      'self-reported 30% improvement',
      'not reader eye-care guidance or medical advice',
      'names no trial, paper, or data',
      'not a Blueprint intervention, an available treatment, or medical advice',
      "confidence: 'low'",
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `August 18–19 signals should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /meibomian[\s\S]*probing[\s\S]*unsettled/i, 'opinion context should keep the MGD therapy-stack details and their limits together');
    assert.match(dashboardSectionsSource, /Interesting Times[\s\S]*media-reception/i, 'timeline should record the NYT podcast item as media reception');

    const blueprintProtocolSource = readFileSync(new URL('../src/content/knowledge/blueprint-protocol.md', import.meta.url), 'utf8');
    assert.match(blueprintProtocolSource, /August 18[\s\S]*meibography[\s\S]*four-therapy[\s\S]*not a validated eye-care protocol/i, 'blueprint-protocol page should extend the eye-health arc with its evidence boundary');

    const biomarkerProtocolsSource = readFileSync(new URL('../src/content/knowledge/biomarker-driven-longevity-protocols.md', import.meta.url), 'utf8');
    assert.match(biomarkerProtocolsSource, /August 18[\s\S]*organ-specific diagnosis[\s\S]*self-reported imaging/i, 'biomarker-protocols page should preserve the feedback-loop framing and its limit');
    assert.match(biomarkerProtocolsSource, /August 19[\s\S]*Phase 3[\s\S]*named no trial/i, 'biomarker-protocols page should keep the mRNA post in research watch');

    for (const required of ['Tumor-fingerprint mRNA therapy reaches Phase 3', 'Eye-health protocol']) {
      assert.match(protocolsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `protocol dossier should include card: ${required}`);
    }
  });

  it('publishes the August 20 dog-adoption post as an attributed observational claim with literature context', () => {
    for (const required of [
      '2090503911493022007',
      'https://x.com/bryan_johnson/status/2090503911493022007',
      '24% lower risk of dying early',
      'Kramer',
      '2019 meta-analysis',
      '2020 reappraisal',
      'confounder-adjusted estimates',
      'nonsignificant',
      'not a demonstrated causal effect',
      'confidence: \'low\'',
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `dog-adoption signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /24% lower risk of dying early[\s\S]*Kramer[\s\S]*nonsignificant[\s\S]*not a demonstrated causal effect/i, 'opinion context should pair the claim with the literature counterpoint');
    assert.match(dashboardSectionsSource, /Dog adoption framed with a 24% mortality-association statistic/, 'timeline should record the dog-adoption item');

    const dontDieSource = readFileSync(new URL('../src/content/knowledge/dont-die.md', import.meta.url), 'utf8');
    assert.match(dontDieSource, /August 20[\s\S]*Katara[\s\S]*24%[\s\S]*Kramer[\s\S]*nonsignificant[\s\S]*not a demonstrated causal effect/i, 'dont-die page should keep the claim and its literature boundary together');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /August 20[\s\S]*Katara[\s\S]*highest-engagement[\s\S]*contested adjustment[\s\S]*not a demonstrated causal effect/i, 'bryan-johnson page should record the dog post with its attribution boundary');
  });

  it('consolidates August 22–24 provenance onto the wiki daily captures', () => {
    assert.match(signalsSource, /x-twitter-daily-2026-08-23\.md/, 'source counts should rotate to the latest wiki capture');
    assert.match(signalsSource, /4 Aug 22–23 posts captured/, 'latest capture count should be shown');
    assert.match(signalsSource, /2 Aug 23–24 posts captured/, 'source counts should keep the August 23–24 capture');
    assert.match(signalsSource, /9 Aug 18–20 posts captured/, 'source counts should keep the August 18–20 capture');

    const updatePage = readFileSync(new URL('../src/content/updates/2026-08-24-cycle-phase-cholesterol-curation.md', import.meta.url), 'utf8');
    assert.match(updatePage, /raw\/articles\/bryan-johnson\/x-twitter-daily-2026-08-23\.md/, 'update page should cite the wiki daily capture');
    assert.match(updatePage, /raw\/articles\/bryan-johnson\/x-twitter-daily-2026-08-24\.md/, 'update page should cite the August 23–24 capture');
  });

  it('publishes the August 24 cycle-phase cholesterol thread as attributed claims with literature context', () => {
    for (const required of [
      'cycle-phase-cholesterol-claims',
      '2091983155700133977',
      'https://x.com/_katetolo/status/2091955753674543337',
      '19% cycle-dependent swing',
      'BioCycle',
      'Mumford et al., 2010',
      '14.3%',
      '7.9%',
      '~6% “mislabeled” figure does not precisely match',
      'not a directive to reinterpret lab results without a clinician',
      "confidence: 'medium'",
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `cycle-phase signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /follicular[\s\S]*BioCycle[\s\S]*does not precisely match[\s\S]*directive to reinterpret labs? (results )?without a clinician/i, 'opinion context should pair the claim with the literature boundary');
    assert.match(dashboardSectionsSource, /Cycle-phase cholesterol claims amplified into the female-protocol narrative/, 'timeline should record the cycle-phase cholesterol item');

    const biomarkerProtocolsSource = readFileSync(new URL('../src/content/knowledge/biomarker-driven-longevity-protocols.md', import.meta.url), 'utf8');
    assert.match(biomarkerProtocolsSource, /August 24[\s\S]*follicular[\s\S]*BioCycle[\s\S]*Mumford et al\., 2010[\s\S]*not a directive to reinterpret lab results without a clinician/i, 'biomarker-protocols page should keep the claim and its literature boundary together');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /August 24[\s\S]*check your girl.s blood work[\s\S]*BioCycle[\s\S]*not medical advice/i, 'bryan-johnson page should record the quote-post with its attribution boundary');
    assert.match(bryanJohnsonSource, /August 22[\s\S]*biggest villain[\s\S]*rhetorical restatement/i, 'bryan-johnson page should record the birthday-window allegory as rhetoric');

    const dontDieSource = readFileSync(new URL('../src/content/knowledge/dont-die.md', import.meta.url), 'utf8');
    assert.match(dontDieSource, /August 22[\s\S]*biggest villain[\s\S]*rhetorical restatement[\s\S]*personal chronology/i, 'dont-die page should keep the allegory and its chronology boundary together');
  });

  it('publishes the August 25 interval-training mortality claim as attributed exercise guidance, not a prescription', () => {
    for (const required of [
      'interval-training-mortality-claim',
      '2092230490581574033',
      'https://x.com/bryan_johnson/status/2092230490581574033',
      'Helgerud et al., 2007',
      'Kodama et al., 2009',
      '13% lower all-cause mortality risk per additional MET',
      'no trial has measured mortality outcomes from eight weeks of intervals',
      'not a demonstrated 8-week mortality outcome, an exercise prescription, or medical advice',
      "confidence: 'medium'",
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `interval-training signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /Helgerud[\s\S]*Kodama[\s\S]*not a demonstrated 8-week mortality outcome, an exercise prescription, or medical advice/i, 'opinion context should pair the protocol claim with the literature boundary');
    assert.match(dashboardSectionsSource, /Interval-training protocol posted with an 11% mortality-reduction claim/, 'timeline should record the interval-training item');

    const biomarkerProtocolsSource = readFileSync(new URL('../src/content/knowledge/biomarker-driven-longevity-protocols.md', import.meta.url), 'utf8');
    assert.match(biomarkerProtocolsSource, /August 25[\s\S]*Helgerud et al\., 2007[\s\S]*Kodama et al\., 2009[\s\S]*not a demonstrated 8-week mortality outcome, an exercise prescription, or medical advice/i, 'biomarker-protocols page should keep the exercise claim and its literature boundary together');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /August 25[\s\S]*Norwegian 4×4[\s\S]*no trial has measured mortality outcomes[\s\S]*exercise prescription, or medical advice/i, 'bryan-johnson page should record the interval-training post with its attribution boundary');

    assert.match(protocolsSource, /interval-training post as an attributed exercise claim, not a prescription[\s\S]*Helgerud et al\. 2007[\s\S]*Kodama et al\. 2009/, 'protocol guidance should keep the interval-training claim in the attributed lane');
  });

  it('publishes the August 26 LDL claim with both unnamed studies identified and bounded', () => {
    for (const required of [
      'ldl-cholesterol-actionability-claim',
      '2092597711543632216',
      'https://x.com/bryan_johnson/status/2092597711543632216',
      'one of the most actionable things from a blood draw',
      'Sabatine et al., 2016',
      'https://doi.org/10.1001/jama.2016.13985',
      'Jenkins et al., 2011',
      'https://doi.org/10.1001/jama.2011.1202',
      '−13.1% to −13.8% LDL',
      'the post names neither study',
      'trial-population relative effect',
      'not a lab-interpretation directive, a diet prescription, or medical advice',
      "confidence: 'medium'",
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `LDL signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /Sabatine[\s\S]*Jenkins[\s\S]*trial-population relative effect[\s\S]*not medical advice/i, 'opinion context should pair the LDL claim with named sources and the boundary');
    assert.match(dashboardSectionsSource, /LDL framed as .one of the most actionable things from a blood draw./, 'timeline should record the LDL item');

    const biomarkerProtocolsSource = readFileSync(new URL('../src/content/knowledge/biomarker-driven-longevity-protocols.md', import.meta.url), 'utf8');
    assert.match(biomarkerProtocolsSource, /August 26[\s\S]*Sabatine et al\., 2016[\s\S]*Jenkins et al\., 2011[\s\S]*LDL interpretation belongs with a clinician[\s\S]*not a lab-interpretation directive, a diet prescription, or medical advice/i, 'biomarker-protocols page should keep the LDL claim and its literature boundary together');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /August 26[\s\S]*Sabatine et al\., 2016[\s\S]*Jenkins et al\., 2011[\s\S]*not an individual guarantee or a lab-interpretation directive[\s\S]*not medical advice/i, 'bryan-johnson page should record the LDL post with its attribution boundary');

    assert.match(protocolsSource, /LDL post as an attributed cholesterol claim[\s\S]*Sabatine et al\. 2016[\s\S]*Jenkins et al\. 2011[\s\S]*not individual guarantees or a lab-interpretation directive/, 'protocol guidance should keep the LDL claim in the attributed lane');
  });

  it('publishes the August 27 nighttime-erection biomarker claim as attributed N=1 material, not monitoring guidance', () => {
    for (const required of [
      'nte-tadalafil-biomarker-claim',
      '2093061998468903267',
      'https://x.com/bryan_johnson/status/2093061998468903267',
      'tier 1 longevity biomarker',
      '2x risk of heart attack and stroke',
      'daily tadalafil 5 mg',
      'Vlachopoulos et al., 2011',
      'https://doi.org/10.1016/j.jacc.2011.06.024',
      'RR 1.48 for CVD, 1.35 for stroke',
      'Krimpen',
      'https://pubmed.ncbi.nlm.nih.gov/17728804/',
      'stronger than the meta-analytic averages',
      'consumer NTE scores are not a validated clinical risk tool',
      'prescription medication requiring clinician oversight',
      'not a validated risk prediction, a monitoring recommendation, or medical advice',
      "confidence: 'low'",
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `NTE signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /Vlachopoulos[\s\S]*Krimpen[\s\S]*stronger than the meta-analytic averages[\s\S]*prescription medication requiring clinician oversight/i, 'opinion context should pair the NTE claim with the literature boundary');
    assert.match(dashboardSectionsSource, /Nighttime-erection .personal best. published as a tier-1-biomarker claim/, 'timeline should record the NTE item');

    const biomarkerProtocolsSource = readFileSync(new URL('../src/content/knowledge/biomarker-driven-longevity-protocols.md', import.meta.url), 'utf8');
    assert.match(biomarkerProtocolsSource, /August 27[\s\S]*Vlachopoulos et al\., 2011[\s\S]*Krimpen[\s\S]*not a validated risk prediction, a monitoring recommendation, or medical advice/i, 'biomarker-protocols page should keep the NTE claim and its literature boundary together');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /August 27[\s\S]*Vlachopoulos et al\., 2011[\s\S]*Krimpen[\s\S]*not a validated risk prediction, a monitoring recommendation, or medical advice/i, 'bryan-johnson page should record the NTE post with its attribution boundary');

    assert.match(protocolsSource, /nighttime-erection post as an attributed N=1 biomarker claim[\s\S]*Vlachopoulos et al\. 2011[\s\S]*Krimpen[\s\S]*requiring clinician oversight/, 'protocol guidance should keep the NTE claim in the attributed lane');
  });

  it('publishes the August 29 NTE age-decline tables as attributed normative-data claims, not reference ranges', () => {
    for (const required of [
      'nte-age-decline-claim',
      '2093698799172829255',
      'https://x.com/bryan_johnson/status/2093698799172829255',
      'Age 20: 190 min, Age 50: 103 min, Age 60: 81 min, Age 75+: 50 min',
      'Karacan et al., 1975',
      'https://doi.org/10.1176/ajp.132.9.932',
      'Schiavi et al., 1988',
      'https://doi.org/10.1093/geronj/43.5.m146',
      'Horita & Kumamoto, 1989',
      '189.6 min',
      'intermediate bins (103/81/50 min) match no single published cohort',
      'Consumer NTE scores are still not a validated clinical risk tool',
      'not a validated risk prediction, a monitoring recommendation, or medical advice',
      "confidence: 'medium'",
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `NTE age-decline signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /Karacan[\s\S]*Schiavi[\s\S]*Horita[\s\S]*intermediate bins match no single published cohort[\s\S]*not a validated risk prediction, a monitoring recommendation, or medical advice/i, 'opinion context should pair the age-decline claim with the normative-literature boundary');
    assert.match(dashboardSectionsSource, /NTE-by-age decline tables posted without naming the normative literature/, 'timeline should record the NTE age-decline item');

    const biomarkerProtocolsSource = readFileSync(new URL('../src/content/knowledge/biomarker-driven-longevity-protocols.md', import.meta.url), 'utf8');
    assert.match(biomarkerProtocolsSource, /August 29[\s\S]*Karacan et al\., 1975[\s\S]*Schiavi et al\., 1988[\s\S]*Horita & Kumamoto, 1989[\s\S]*not a validated risk prediction, a monitoring recommendation, or medical advice/i, 'biomarker-protocols page should keep the age-decline claim and its literature boundary together');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /August 28–29[\s\S]*190 minutes at age 20[\s\S]*Karacan[\s\S]*Horita & Kumamoto, 1989[\s\S]*not a risk prediction or medical advice/i, 'bryan-johnson page should record the age-decline arc with its attribution boundary');

    assert.match(protocolsSource, /NTE-by-age decline tables as an attributed normative-data claim[\s\S]*Karacan et al\. 1975[\s\S]*Schiavi et al\. 1988[\s\S]*Horita & Kumamoto 1989[\s\S]*not a validated risk prediction or monitoring recommendation/, 'protocol guidance should keep the age-decline claim in the attributed lane');

    const updatePage = readFileSync(new URL('../src/content/updates/2026-08-29-nte-age-decline-claim-curation.md', import.meta.url), 'utf8');
    assert.match(updatePage, /knowledge\/raw\/x\/2026-08-30\/2026-08-30-bryan-johnson-batch\.md/, 'update page should cite the August 30 capture');
    assert.match(updatePage, /dunk-training strength PR/, 'update page should document the dunk-post skip decision');
    assert.match(updatePage, /three prior dunk-post skip decisions \(July 25, August 2, and August 18\)/, 'update page should state the accurate three-decision dunk skip history');
    assert.doesNotMatch(updatePage, /four prior dunk-post skip decisions \(August 2, 18, 19/, 'update page must not repeat the phantom August 19 dunk date');
  });

  it('publishes the August 30 Kate Tolo cycle readout and Kernel brain-scan percentiles as attributed claims', () => {
    for (const required of [
      'kate-tolo-measured-cycle-readout',
      '2094160047253369203',
      '408 minutes of Kernel brain data',
      '48,960 core-temperature readings',
      '14 million data points',
      'the world’s most measured woman',
      'attributed N=1 program readout',
      'not completed female-health evidence, a representative protocol, or medical advice',
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Kate Tolo cycle signal should preserve: ${required}`);
    }

    for (const required of [
      'kernel-brain-scan-percentile-claims',
      '2094112145357291863',
      'amygdala 95th',
      'putamen 99th',
      'caudate 97th',
      'frontal gray matter at the 78th percentile',
      'Draganski et al., 2004',
      'https://doi.org/10.1038/427311a',
      'Colcombe et al., 2006',
      'https://doi.org/10.1093/gerona/61.11.1166',
      'the post names no study',
      'speculative for my n of 1 context',
      'not a validated brain-health metric, evidence that his protocol grew his frontal cortex, or medical advice',
      "confidence: 'medium'",
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Kernel brain-scan signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /amygdala 95th[\s\S]*putamen 99th[\s\S]*Draganski et al\., 2004[\s\S]*Colcombe et al\., 2006[\s\S]*not a validated brain-health metric, evidence that his protocol grew his frontal cortex, or medical advice/i, 'opinion context should pair the brain-percentile claim with the plasticity-literature boundary');
    assert.match(dashboardSectionsSource, /most measured menstrual cycle in history[\s\S]*48,960 core-temperature readings[\s\S]*attributed N=1 program readout/i, 'timeline should record the Kate Tolo cycle readout');
    assert.match(dashboardSectionsSource, /Kernel brain-scan percentiles published as a personality operating manual/, 'timeline should record the Kernel brain-scan item');

    const kernelPageSource = readFileSync(new URL('../src/content/knowledge/kernel.md', import.meta.url), 'utf8');
    assert.match(kernelPageSource, /August 2026 percentile post[\s\S]*Draganski et al\., 2004[\s\S]*Colcombe et al\., 2006[\s\S]*not a validated brain-health metric/i, 'kernel knowledge page should connect the percentile post to the brain-measurement thesis with its boundary');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /On August 30[\s\S]*most measured menstrual cycle in history[\s\S]*48,960 core-temperature readings[\s\S]*Draganski et al\., 2004[\s\S]*Colcombe et al\., 2006[\s\S]*not a validated brain-health metric/i, 'bryan-johnson page should record the August 30 arc with its attribution boundary');

    const biomarkerProtocolsSource = readFileSync(new URL('../src/content/knowledge/biomarker-driven-longevity-protocols.md', import.meta.url), 'utf8');
    assert.match(biomarkerProtocolsSource, /On August 30, the measurement loop moved to the brain[\s\S]*Draganski et al\., 2004[\s\S]*Colcombe et al\., 2006[\s\S]*not a validated brain-health metric/i, 'biomarker-protocols page should keep the brain-scan claim and its literature boundary together');

    assert.match(protocolsSource, /Kernel brain-scan percentile post as an attributed self-report[\s\S]*Draganski et al\. 2004[\s\S]*Colcombe et al\. 2006[\s\S]*not a brain-health metric, evidence the protocol grew his frontal cortex, or medical advice/, 'protocol guidance should keep the brain-scan claim in the attributed lane');
    assert.match(protocolsSource, /Brain-scan percentiles[\s\S]*personality operating manual/, 'protocol dossier should carry a brain-scan percentile card');

    const updatePage = readFileSync(new URL('../src/content/updates/2026-08-30-kate-tolo-kernel-brain-curation.md', import.meta.url), 'utf8');
    assert.match(updatePage, /knowledge\/raw\/x\/2026-08-31\/2026-08-31-bryan-johnson-batch\.md/, 'update page should cite the August 31 capture');
    assert.match(updatePage, /son-photo identity post/, 'update page should document the low-signal skip decisions');
    assert.match(updatePage, /Rutger Bregman technology-alarm quote-post/, 'update page should document the Bregman skip decision');
  });

  it('publishes the September 2 "I am 18", timed blood-collection, and caffeine-forensics posts as attributed claims', () => {
    for (const required of [
      'eighteen-year-old-multi-system-claims',
      '2094944302900367425',
      'https://x.com/bryan_johnson/status/2094944302900367425',
      'fourteen systems',
      'sleep quality, erection function, fertility, resting heart rate, vascular health, cardiovascular health, blood pressure, metabolic health, blood glucose control, bone mineral density, muscle, fat',
      'hearing and somatic mutations',
      'the first rep',
      'no dataset, assay methods, reference cohort, or comparison standard',
      'not evidence of system-by-system youthful equivalence, a promise readers can replicate the result, or medical advice',
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `"I am 18" signal should preserve: ${required}`);
    }

    for (const required of [
      'kate-tolo-timed-blood-collection',
      '2094516331903340742',
      'https://x.com/bryan_johnson/status/2094516331903340742',
      'six-hour collection window',
      '7 mL of menstrual blood',
      '35-day delay',
      'frontier science',
      'not a validated diagnostic workflow, evidence the sample is scientifically useful, or medical advice',
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `blood-collection signal should preserve: ${required}`);
    }

    for (const required of [
      'caffeine-forensics-injury-risk-claim',
      '2095236652918812756',
      'https://x.com/bryan_johnson/status/2095236652918812756',
      'increase injury risk by 70-130%',
      '~75 dBA cafe background',
      '−3 dB signal-to-noise ratio',
      '~1-in-8 cafe order error rate',
      '~55% chance the barista recognized him',
      'Milewski et al., 2014',
      'https://doi.org/10.1097/BPO.0000000000000151',
      'von Rosen et al., 2017',
      'https://doi.org/10.1111/sms.12855',
      'not a validated acute-injury statistic, sleep guidance, or medical advice',
      "confidence: 'medium'",
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `caffeine-forensics signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /indistinguishable from an 18-year-old[\s\S]*no dataset, assay methods, or reference cohort[\s\S]*not evidence of youthful equivalence, a replication promise, or medical advice/i, 'opinion context should pair the "I am 18" claim with its boundary');
    assert.match(dashboardSectionsSource, /fourteen systems claimed indistinguishable from an 18-year-old/i, 'timeline should record the "I am 18" item');
    assert.match(dashboardSectionsSource, /Milewski[\s\S]*von Rosen[\s\S]*not a validated acute-injury statistic or medical advice/i, 'opinion context should pair the injury figure with the sleep/injury literature');
    assert.match(dashboardSectionsSource, /six-hour global logistics event/i, 'timeline should record the timed blood collection');
    assert.match(dashboardSectionsSource, /Cycle start becomes a six-hour global logistics event/, 'timeline should record the blood-collection item');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /On September 1–2[\s\S]*in many ways, I am 18[\s\S]*hearing and somatic mutations[\s\S]*not evidence of system-by-system youthful equivalence, a replication promise, or medical advice/i, 'bryan-johnson page should record the September arc with its attribution boundary');

    const algorithmicHealthPage = readFileSync(new URL('../src/content/knowledge/algorithmic-health.md', import.meta.url), 'utf8');
    assert.match(algorithmicHealthPage, /On September 1–2[\s\S]*sound meter[\s\S]*Milewski et al\., 2014[\s\S]*von Rosen et al\., 2017[\s\S]*none of it is sleep guidance or medical advice/i, 'algorithmic-health page should keep the forensic detail and literature boundary together');

    const biomarkerProtocolsSource = readFileSync(new URL('../src/content/knowledge/biomarker-driven-longevity-protocols.md', import.meta.url), 'utf8');
    assert.match(biomarkerProtocolsSource, /On September 2[\s\S]*in many ways, I am 18[\s\S]*no dataset, assay list, reference cohort[\s\S]*not evidence of youthful equivalence, a replication promise, or medical advice/i, 'biomarker-protocols page should keep the outcome claim and its boundary together');

    assert.match(protocolsSource, /caffeine-mistake chronology as an algorithmic-health example[\s\S]*Milewski et al\. 2014[\s\S]*von Rosen et al\. 2017[\s\S]*not reader sleep or training guidance/, 'sleep protocol guidance should keep the caffeine chronology in the attributed lane');

    const updatePage = readFileSync(new URL('../src/content/updates/2026-09-03-i-am-18-claims-caffeine-forensics-curation.md', import.meta.url), 'utf8');
    assert.match(updatePage, /knowledge\/raw\/x\/2026-09-03\/2026-09-03-bryan-johnson-batch\.md/, 'update page should cite the September 3 capture');
    assert.match(updatePage, /dunk-training posts/, 'update page should document the dunk-post skip decision');
    assert.match(updatePage, /four prior dunk-post skip decisions \(July 25, August 2, 18, and 28\)/, 'update page should state the accurate four-decision dunk skip history');
    assert.doesNotMatch(updatePage, /19, 28, 29\)/, 'update page must not repeat the phantom dunk dates');
    assert.doesNotMatch(updatePage, /six prior dunk/, 'update page must not claim six prior dunk skips');
  });

  it('publishes the September 4 Eight Sleep sleep-fingerprint announcement as an attributed product claim with verified preprint context', () => {
    for (const required of [
      'eight-sleep-sleep-fingerprint-model',
      '2095675388810936586',
      'https://x.com/bryan_johnson/status/2095675388810936586',
      'https://arxiv.org/abs/2606.07692',
      'BCG-FM',
      '2.04 million hours of bed-sensor ballistocardiography from 136,575 participants',
      '3.26 years',
      '92.5% Rank-1 identity retrieval',
      '0.852 for diabetes',
      '0.822 for heart failure',
      '0.792 for sleep apnea',
      'self-reported',
      'not peer-reviewed',
      'has no corresponding comparison in the preprint',
      'a research milestone, not a diagnostic device',
      'not a validated diagnostic, a reader health claim, or medical advice',
      "confidence: 'medium'",
    ]) {
      assert.match(signalsSource, new RegExp(required.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'i'), `Eight Sleep signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /arXiv:2606\.07692[\s\S]*3\.26 years[\s\S]*not a validated diagnostic, a reader health claim, or medical advice/i, 'opinion context should pair the Eight Sleep claim with the preprint boundary');
    assert.match(dashboardSectionsSource, /Eight Sleep .sleep fingerprint. model announced as a biological-age product/, 'timeline should record the Eight Sleep item');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /On September 4[\s\S]*arXiv:2606\.07692[\s\S]*not a validated diagnostic, a purchasing signal, or medical advice/i, 'bryan-johnson page should record the Eight Sleep announcement with its attribution boundary');

    const biomarkerProtocolsSource = readFileSync(new URL('../src/content/knowledge/biomarker-driven-longevity-protocols.md', import.meta.url), 'utf8');
    assert.match(biomarkerProtocolsSource, /On September 4[\s\S]*arXiv:2606\.07692[\s\S]*not a validated diagnostic, clinical risk tool, purchasing guidance, or medical advice/i, 'biomarker-protocols page should keep the Eight Sleep claim and its preprint boundary together');

    const algorithmicHealthPage = readFileSync(new URL('../src/content/knowledge/algorithmic-health.md', import.meta.url), 'utf8');
    assert.match(algorithmicHealthPage, /On September 4[\s\S]*Autonomous Health[\s\S]*arXiv:2606\.07692[\s\S]*not a validated ambient diagnostic/i, 'algorithmic-health page should record the Autonomous Health instantiation with its boundary');

    assert.match(protocolsSource, /Eight Sleep .sleep fingerprint. announcement as an attributed product-launch and research claim[\s\S]*arXiv:2606\.07692[\s\S]*not a diagnostic device/, 'sleep protocol guidance should keep the Eight Sleep claim in the attributed lane');
    assert.match(protocolsSource, /label: 'Sleep fingerprint'/, 'sleep protocol dossier should carry a sleep-fingerprint card');

    const updatePage = readFileSync(new URL('../src/content/updates/2026-09-06-eight-sleep-sleep-fingerprint-model-curation.md', import.meta.url), 'utf8');
    assert.match(updatePage, /knowledge\/raw\/x\/2026-09-05\/2026-09-05-bryan-johnson-batch\.md/, 'update page should cite the September 5 capture');
    assert.match(updatePage, /five prior dunk-post skip decisions \(July 25, August 2, 18, 28, and September 1\)/, 'update page should state the accurate five-decision dunk skip history');
  });

  it('publishes the September 29 altitude wearable readout as an attributed N=1 with verified literature direction', () => {
    for (const required of [
      'altitude-wearable-dips',
      '2104962827073040874',
      'https://x.com/bryan_johnson/status/2104962827073040874',
      'https://doi.org/10.5665/sleep.3242',
      'https://doi.org/10.1371/journal.pone.0070081',
      'Latshang et al., Sleep 2013',
      'AHI 4.6/h at 490 m to 13.1/h',
      '96%→90%',
      'proprietary wearable-index deltas',
      'acclimatization by the second night',
      'not evidence that moderate-altitude travel is harmful, a travel or sleep recommendation, or medical advice',
      "confidence: 'medium'",
    ]) {
      assert.match(signalsSource, new RegExp(required, 'i'), `altitude signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /Latshang[^]*10[.]5665\/sleep[.]3242[^]*not evidence moderate-altitude travel is harmful, travel or sleep guidance, or medical advice/i, 'timeline should pair the altitude claim with the literature boundary');
    assert.match(dashboardSectionsSource, /Altitude trip quantified as wearable deltas/, 'timeline should record the altitude item');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /On September 29[^]*Latshang et al[.,]+ Sleep 2013[^]*not evidence that moderate-altitude travel is harmful, travel or sleep guidance, or medical advice/i, 'bryan-johnson page should record the altitude post with its attribution boundary');

    const biomarkerProtocolsSource = readFileSync(new URL('../src/content/knowledge/biomarker-driven-longevity-protocols.md', import.meta.url), 'utf8');
    assert.match(biomarkerProtocolsSource, /On September 29[^]*10[.]5665\/sleep[.]3242[^]*not evidence that moderate-altitude travel is harmful, a travel or sleep recommendation, or medical advice/i, 'biomarker-protocols page should keep the altitude claim and its literature boundary together');

    const algorithmicHealthPage = readFileSync(new URL('../src/content/knowledge/algorithmic-health.md', import.meta.url), 'utf8');
    assert.match(algorithmicHealthPage, /On September 29[^]*Latshang et al[.,]+ Sleep 2013[^]*not polysomnography[^]*not evidence that moderate-altitude travel is harmful/i, 'algorithmic-health page should record the altitude observation with its boundary');

    assert.match(protocolsSource, /altitude readout as an attributed N=1 wearable observation, not travel or sleep guidance[^]*Latshang et al[.,]+ Sleep 2013[^]*10[.]1371\/journal[.]pone[.]0070081/, 'sleep protocol guidance should keep the altitude claim in the attributed lane');
    assert.match(protocolsSource, /label: 'Altitude N=1'/, 'sleep protocol dossier should carry an altitude card');

    const updatePage = readFileSync(new URL('../src/content/updates/2026-09-30-altitude-wearable-deltas-curation.md', import.meta.url), 'utf8');
    assert.match(updatePage, /knowledge\/raw\/x\/2026-09-30\/2026-09-30-bryan-johnson-batch[.]md/, 'update page should cite the September 30 capture');
    assert.match(updatePage, /no gap[^]*Johnson posted nothing September 26/, 'update page should state the verified no-gap audit result');
  });

  it('publishes the September 30 sea-level rebound post as an attributed N=1 epilogue with verified descent literature', () => {
    for (const required of [
      'altitude-sea-level-rebound',
      '2105304207083573462',
      'https://x.com/bryan_johnson/status/2105304207083573462',
      'https://doi.org/10.1007/s44470-026-00128-1',
      'Deflorin et al., J Clin Sleep Med',
      'time under 90% oxygen saturation 5→1 min',
      'AHI 14.2→9.2/h',
      '93.8%→95.2%',
      'altitude residents descending',
      'not evidence of a rebound effect, travel or sleep guidance, or medical advice',
      "confidence: 'medium'",
    ]) {
      assert.match(signalsSource, new RegExp(required, 'i'), `rebound signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /Deflorin[^]*10[.]1007\/s44470-026-00128-1[^]*not evidence of a rebound effect, travel or sleep guidance, or medical advice/i, 'timeline should pair the rebound claim with the literature boundary');
    assert.match(dashboardSectionsSource, /Sea-level rebound quantified/, 'timeline should record the rebound item');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /On September 30[^]*Deflorin et al[.,]+ J Clin Sleep Med[^]*10[.]1007\/s44470-026-00128-1[^]*not evidence of a rebound effect, travel or sleep guidance, or medical advice/i, 'bryan-johnson page should record the rebound post with its attribution boundary');

    const biomarkerProtocolsSource = readFileSync(new URL('../src/content/knowledge/biomarker-driven-longevity-protocols.md', import.meta.url), 'utf8');
    assert.match(biomarkerProtocolsSource, /On September 30[^]*10[.]1007\/s44470-026-00128-1[^]*not evidence of a rebound effect, a travel or sleep recommendation, or medical advice/i, 'biomarker-protocols page should keep the rebound claim and its literature boundary together');

    const algorithmicHealthPage = readFileSync(new URL('../src/content/knowledge/algorithmic-health.md', import.meta.url), 'utf8');
    assert.match(algorithmicHealthPage, /On September 30[^]*Deflorin et al[.,]+ J Clin Sleep Med[^]*not polysomnography|On September 30[^]*Deflorin et al[.,]+ J Clin Sleep Med[^]*instrument problem in reverse/i, 'algorithmic-health page should record the rebound observation with its boundary');

    assert.match(protocolsSource, /sea-level rebound post as the attributed epilogue to the altitude readout, not evidence of a rebound effect[^]*Deflorin et al[.,]+ J Clin Sleep Med[^]*10[.]1007\/s44470-026-00128-1/, 'sleep protocol guidance should keep the rebound claim in the attributed lane');
    assert.match(protocolsSource, /label: 'Altitude rebound'/, 'sleep protocol dossier should carry a rebound card');
    assert.match(signalsSource, /1 Sep 30 post captured · knowledge\/raw\/x\/2026-10-01 bryan-johnson-batch/, 'source counts should rotate to the October 1 capture');
    assert.match(signalsSource, /194 Aug 14–Sep 30 posts reviewed/, 'audit window should extend to September 30');

    const updatePage = readFileSync(new URL('../src/content/updates/2026-10-01-sea-level-rebound-curation.md', import.meta.url), 'utf8');
    assert.match(updatePage, /knowledge\/raw\/x\/2026-10-01\/2026-10-01-bryan-johnson-batch[.]md/, 'update page should cite the October 1 capture');
    assert.match(updatePage, /no gap[^]*the September 30 14:30 UTC rebound post is the newest item/, 'update page should state the verified no-gap audit result');
  });

  it('publishes the October 1 cognitive-light-cone posts as an attributed Don’t Die ideology formulation with verified origin and budget context', () => {
    for (const required of [
      'cognitive-light-cone-ideology',
      '2105756629530542105',
      'https://x.com/bryan_johnson/status/2105756629530542105',
      'https://x.com/bryan_johnson/status/2105762956646449427',
      'https://doi.org/10.3389/fpsyg.2019.02688',
      'The Computational Boundary of a Self',
      'Frontiers in Psychology, 2019',
      'dedicated geroscience request is $25.0 million in the FY2027',
      '0.05% of NIH’s roughly $48 billion',
      '$342.3 million in FY2025',
      'thermodynamic entropy',
      'not an established species-level metric, a funding recommendation, or medical advice',
      "confidence: 'medium'",
    ]) {
      assert.ok(signalsSource.includes(required), `light-cone signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /Cognitive light cone[^]*10[.]3389\/fpsyg[.]2019[.]02688[^]*not an established species-level metric, a funding recommendation, or medical advice/i, 'timeline should pair the light-cone claim with the origin and budget boundary');
    assert.match(dashboardSectionsSource, /cognitive light cone.*becomes a Don’t Die species metric/i, 'timeline should record the light-cone item');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /On October 1[^]*10[.]3389\/fpsyg[.]2019[.]02688[^]*not an established species-level metric, a funding recommendation, or medical advice/i, 'bryan-johnson page should record the light-cone post with its attribution boundary');

    const dontDieSource = readFileSync(new URL('../src/content/knowledge/dont-die.md', import.meta.url), 'utf8');
    assert.match(dontDieSource, /On October 1[^]*10[.]3389\/fpsyg[.]2019[.]02688[^]*not an established species-level metric, a funding recommendation, or medical advice/i, 'dont-die page should record the ideology formulation with its boundary');

    assert.match(signalsSource, /30 Sep 17–Oct 1 posts reviewed/, 'audit window should cover this pass');
    assert.match(signalsSource, /12 knowledge pages \+ 82 update pages/, 'site content count should include the new update page');

    const updatePage = readFileSync(new URL('../src/content/updates/2026-10-02-cognitive-light-cone-curation.md', import.meta.url), 'utf8');
    assert.match(updatePage, /knowledge\/raw\/x\/2026-10-01\/2026-10-01-bryan-johnson-batch[.]md/, 'update page should cite the October 1 capture');
    assert.match(updatePage, /Skipped the @jgebbia post/, 'update page should document the off-topic skip decision');
  });

  it('publishes the October 2 Petit Le Mans posts as an attributed algorithmic-health method export with verified racing context', () => {
    for (const required of [
      'petit-le-mans-biomarker-review',
      '2106113593481609361',
      'https://x.com/bryan_johnson/status/2106101026646339833',
      'https://x.com/bryan_johnson/status/2106113593481609361',
      'https://x.com/bryan_johnson/status/2106118709568016883',
      'reviewing Tobi’s performance via biomarkers',
      'No. 11 TDS Racing ORECA LMP2 07',
      'Motul Petit Le Mans',
      'https://doi.org/10.1519/JSC.0000000000002268',
      '159–170 bpm',
      '0.6 L/h',
      'announced, not published',
      'not evidence that biomarker review improves driving performance, a training or hydration protocol, or medical advice',
      "confidence: 'medium'",
    ]) {
      assert.ok(signalsSource.includes(required), `petit-le-mans signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /reviewing Tobi’s performance via biomarkers[^]*not evidence that biomarker review improves driving performance, a training or hydration protocol, or medical advice/i, 'timeline should pair the method-export claim with its boundary');
    assert.match(dashboardSectionsSource, /Algorithmic health applied to someone else/i, 'timeline should record the Petit Le Mans item');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /On October 2[^]*10[.]1519\/JSC[.]0000000000002268[^]*not evidence that biomarker review improves driving performance, a training or hydration protocol, or medical advice/i, 'bryan-johnson page should record the Petit Le Mans method export with its boundary');

    const algorithmicHealthPage = readFileSync(new URL('../src/content/knowledge/algorithmic-health.md', import.meta.url), 'utf8');
    assert.match(algorithmicHealthPage, /On October 2[^]*reviewing Tobi’s performance via biomarkers[^]*not evidence that biomarker review improves driving performance, a training or hydration protocol, or medical advice/i, 'algorithmic-health page should record the method export with its boundary');

    const braintreeSource = readFileSync(new URL('../src/content/knowledge/braintree.md', import.meta.url), 'utf8');
    assert.match(braintreeSource, /first customers[^]*37signals[^]*Treat the “first customers” ordering as Johnson’s attribution/, 'braintree page should record the first-customers attribution with its verifiable fact');

    assert.match(signalsSource, /30 Sep 18–Oct 2 posts reviewed/, 'audit window should cover this pass');
    assert.match(signalsSource, /12 knowledge pages \+ 82 update pages/, 'site content count should include the new update page');

    const updatePage = readFileSync(new URL('../src/content/updates/2026-10-03-petit-le-mans-biomarker-review-curation.md', import.meta.url), 'utf8');
    assert.match(updatePage, /IMSA’s official entry list/, 'update page should document the entry-list verification');
    assert.match(updatePage, /folded into the braintree knowledge page/, 'update page should document the Braintree handling decision');
  });

  it('publishes the October 3 race-day posts as attributed claims with verified neuroscience and physiology context', () => {
    for (const required of [
      'petit-le-mans-race-day-blood-draw',
      '2106505132729119179',
      'racing-cognitive-enhancement-claims',
      '2106404568401682468',
      'https://x.com/bryan_johnson/status/2106401417707569368',
      'I collected Tobi’s blood before and after his 2.5 hr race',
      'It’s deep molecular profiling',
      '715 lbs of force',
      'roughly triple the ~0.6 L/h',
      'https://doi.org/10.1038/nature12486',
      'https://doi.org/10.1371/journal.pone.0077764',
      'https://doi.org/10.3389/fnhum.2014.00888',
      'NeuroRacer',
      'unable to separate training from selection',
      'not evidence that molecular profiling of drivers is novel or useful',
      'not evidence that racing is a cognitive-enhancement intervention, a brain-training recommendation, or medical advice',
      "confidence: 'medium'",
    ]) {
      assert.ok(signalsSource.includes(required), `race-day signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /The racing experiment runs[^]*not evidence that molecular profiling of drivers is novel or useful[^]*or medical advice/i, 'timeline should pair the race-day claim with its boundary');
    assert.match(dashboardSectionsSource, /The racing experiment runs/i, 'timeline should record the race-day item');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /On October 3, race day[^]*10[.]1038\/nature12486[^]*not evidence that molecular profiling of drivers is novel or useful[^]*or medical advice/i, 'bryan-johnson page should record the race-day experiment with its boundary');

    const algorithmicHealthPage = readFileSync(new URL('../src/content/knowledge/algorithmic-health.md', import.meta.url), 'utf8');
    assert.match(algorithmicHealthPage, /On October 3, race day[^]*10[.]1371\/journal[.]pone[.]0077764[^]*not evidence that molecular profiling of drivers is novel or useful[^]*or medical advice/i, 'algorithmic-health page should record the race-day experiment with its boundary');

    assert.match(signalsSource, /50 Sep 11–Oct 4 posts reviewed/, 'audit window should cover this pass');
    assert.match(signalsSource, /12 knowledge pages \+ 82 update pages/, 'site content count should include the new update page');

    const updatePage = readFileSync(new URL('../src/content/updates/2026-10-04-petit-le-mans-race-day-curation.md', import.meta.url), 'utf8');
    assert.match(updatePage, /50 posts spanning September 11–October 3/, 'update page should document the audit window');
    assert.match(updatePage, /10[.]1038\/nature12486/, 'update page should document the NeuroRacer verification');
    assert.match(updatePage, /compression, not a measured count/, 'update page should document the neural-efficiency compression boundary');
  });

  it('publishes the October 4 road-trip epilogue as an attributed behavior statement closing a measured arc', () => {
    for (const required of [
      'road-trip-order-restored-epilogue',
      '2106802267391393807',
      'https://x.com/bryan_johnson/status/2106802267391393807',
      'Order has been restored',
      'I crave the discomfort',
      'ten days inclusive',
      'arc’s only unquantified',
      'identity language',
      'not evidence that the five-hour routine produces its claimed benefits, a reader routine, or medical advice',
      "confidence: 'medium'",
    ]) {
      assert.ok(signalsSource.includes(required), `epilogue signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /Order has been restored[^]*not evidence that the five-hour routine produces its claimed benefits, a reader routine, or medical advice/i, 'timeline should pair the epilogue statement with its boundary');
    assert.match(dashboardSectionsSource, /Ten-day road trip ends at home/i, 'timeline should record the epilogue item');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /On October 4[^]*Order has been restored[^]*not evidence that the five-hour routine produces its claimed benefits, a reader routine, or medical advice/i, 'bryan-johnson page should record the epilogue with its boundary');

    const algorithmicHealthPage = readFileSync(new URL('../src/content/knowledge/algorithmic-health.md', import.meta.url), 'utf8');
    assert.match(algorithmicHealthPage, /On October 4[^]*Order has been restored[^]*not evidence that the five-hour routine produces its claimed benefits, a reader routine, or medical advice/i, 'algorithmic-health page should record the epilogue with its boundary');

    assert.match(signalsSource, /50 Sep 11–Oct 4 posts reviewed/, 'audit window should cover this pass');
    assert.match(signalsSource, /12 knowledge pages \+ 82 update pages/, 'site content count should include the new update page');

    const updatePage = readFileSync(new URL('../src/content/updates/2026-10-05-road-trip-epilogue-curation.md', import.meta.url), 'utf8');
    assert.match(updatePage, /50 posts spanning September 11–October 4/, 'update page should document the audit window');
    assert.match(updatePage, /ten days inclusive/, 'update page should document the arithmetic check');
  });

  it('publishes the October 5 race readout as an attributed narrative with the blood panel still unpublished', () => {
    for (const required of [
      'petit-le-mans-biomarker-results',
      '2106927047134343298',
      'https://x.com/bryan_johnson/status/2106927047134343298',
      '171 bpm',
      '4.6% of body mass',
      '41 breaths/min',
      'already at 136 bpm thirty minutes before the race',
      'fastest race lap on lap 88 at 1:15.359',
      'https://doi.org/10.1249/MSS.0000000000001682',
      'Wittbrodt',
      'reaction-time-specific effects nonsignificant',
      'still have no panel, method, or result',
      'wearable-and-telemetry narrative',
      'not evidence that biomarker review improves driving performance, a hydration strategy, or medical advice',
      "confidence: 'medium'",
    ]) {
      assert.ok(signalsSource.includes(required), `race readout signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /A four-post day[^]*not evidence that biomarker review improves driving performance[^]*or medical advice/i, 'timeline should pair the October 5 cluster with its boundary');
    assert.match(dashboardSectionsSource, /A four-post day/i, 'timeline should record the October 5 cluster item');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /On October 5–6[^]*10[.]1249\/MSS[.]0000000000001682[^]*not evidence that biomarker review improves driving performance[^]*or medical advice/i, 'bryan-johnson page should record the cluster with its boundary');

    const algorithmicHealthPage = readFileSync(new URL('../src/content/knowledge/algorithmic-health.md', import.meta.url), 'utf8');
    assert.match(algorithmicHealthPage, /On October 5, the method-export loop closed its narrative[^]*10[.]1249\/MSS[.]0000000000001682[^]*not evidence that biomarker review improves driving performance, a hydration strategy, or medical advice/i, 'algorithmic-health page should record the readout with its boundary');
  });

  it('publishes the October 5 male-body claims post with three of five figures verified', () => {
    for (const required of [
      'male-body-by-50-claims',
      '2107147209959727153',
      'https://x.com/bryan_johnson/status/2107147209959727153',
      'testosterone down 30%',
      'prostate enlargement in 50% of men',
      'Massachusetts Male Aging Study',
      '1.6%/yr',
      '4.7% of peak mass per decade',
      'Berry',
      '50% of men show pathological benign prostatic hyperplasia at ages 51–60',
      'arterial-stiffness and bone-density percentages name no source',
      'not a diagnosis, a male-aging checklist, or medical advice',
      "confidence: 'medium'",
    ]) {
      assert.ok(signalsSource.includes(required), `male-body signal should preserve: ${required}`);
    }

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /On October 5–6[^]*Massachusetts Male Aging Study[^]*Berry et al[.’s]+ 1984 autopsy series[^]*a male-aging checklist, a dosing directive, a sleep-safety guideline, or medical advice/i, 'bryan-johnson page should record the male-body claims with verified context');
  });

  it('publishes the zolpidem quote-post as a female-health claim verified against the FDA label', () => {
    for (const required of [
      'zolpidem-sex-difference-claim',
      '2107215752637878559',
      'https://x.com/bryan_johnson/status/2107215752637878559',
      'https://x.com/_katetolo/status/2106820447300198810',
      '45% higher blood concentrations of ambien',
      'Gender Difference in Pharmacokinetics',
      'approximately 45% higher at the same dose',
      'January 2013 safety communication halved the recommended bedtime dose for women',
      'Schedule IV prescription hypnotic',
      'verified regulatory provenance',
      'not a dosing directive, a medication change without a prescriber, or medical advice',
      "confidence: 'high'",
    ]) {
      assert.ok(signalsSource.includes(required), `zolpidem signal should preserve: ${required}`);
    }

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /On October 5–6[^]*FDA Ambien label[^]*January 2013 halving of the recommended bedtime dose for women[^]*a dosing directive/i, 'bryan-johnson page should record the zolpidem verification');
  });

  it('publishes the October 6 night-terror post as an attributed coda with verified mechanism context', () => {
    for (const required of [
      'night-terror-altitude-coda',
      '2107263567800238552',
      'https://x.com/bryan_johnson/status/2107263567800238552',
      'throwing myself off the bed and bloodying up my back, sides and arms',
      'runaway train',
      'non-REM disorders of arousal',
      'stage N3',
      '1-3 hours after sleep onset',
      'REM’s muscle atonia',
      'sleep deprivation is a documented precipitant',
      'self-diagnosed, unmonitored account',
      'not evidence that altitude travel causes night terrors, a sleep-safety guideline, or medical advice',
      "confidence: 'medium'",
    ]) {
      assert.ok(signalsSource.includes(required), `night-terror signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /unplanned coda[^]*not evidence that altitude travel causes night terrors, a sleep-safety guideline, or medical advice/i, 'timeline should pair the night-terror post with its boundary');
    assert.match(dashboardSectionsSource, /self-injuring night terror/i, 'timeline should record the night-terror item');

    const algorithmicHealthPage = readFileSync(new URL('../src/content/knowledge/algorithmic-health.md', import.meta.url), 'utf8');
    assert.match(algorithmicHealthPage, /On October 6, the altitude arc acquired an unplanned coda[^]*not evidence that altitude travel causes night terrors, a sleep-safety guideline, or medical advice/i, 'algorithmic-health page should record the night terror with its boundary');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /On October 5–6[^]*night-terror post closed the altitude arc[^]*a sleep-safety guideline, or medical advice/i, 'bryan-johnson page should record the night terror within the cluster paragraph');
  });

  it('rotates audit-window and site-content counters for the October 6 pass', () => {
    assert.match(signalsSource, /50 Sep 11–Oct 6 posts reviewed/, 'audit window should cover this pass');
    assert.match(signalsSource, /12 knowledge pages \+ 82 update pages/, 'site content count should include the new update page');
    assert.match(signalsSource, /7 sources matched earlier pass · FDA zolpidem label/, 'studies-verified counter should cover this pass');

    const updatePage = readFileSync(new URL('../src/content/updates/2026-10-06-post-trip-cluster-curation.md', import.meta.url), 'utf8');
    assert.match(updatePage, /50 posts spanning September 11–October 6/, 'update page should document the audit window');
    assert.match(updatePage, /10[.]1249\/MSS[.]0000000000001682/, 'update page should document the dehydration-literature verification');
    assert.match(updatePage, /reaction-time-specific effects were nonsignificant/, 'update page should document the RT-specific boundary');
    assert.match(updatePage, /10[.]1016\/S0022-5347\(17\)49698-4/, 'update page should document the BPH verification');
    assert.match(updatePage, /Gender Difference in Pharmacokinetics/, 'update page should document the FDA label verification');
    assert.match(updatePage, /Skipped as chronology-only[^]*435-lb lift[^]*Robert Greene/s, 'update page should document the skip decisions');
  });

  it('publishes the October 6 manifesto as an attributed ideology essay with verified quotation provenance', () => {
    for (const required of [
      'dont-die-zero-manifesto',
      '2107556620247163208',
      'https://x.com/bryan_johnson/status/2107556620247163208',
      'Am I a madman or messiah?',
      'Talent hits a target no one else can hit. Genius hits a target no one else can see',
      'World as Will and Representation',
      'Don’t Die is the Zero',
      'We are performance artists',
      'compression thesis',
      'does not reconcile with the tracked August 1977 birth date',
      'he would have been 36',
      'the 90%/99.9% compression figures are uncited',
      'verified quotation provenance',
      'not evidence about mortality, a social prediction, or medical advice',
      "confidence: 'medium'",
    ]) {
      assert.ok(signalsSource.includes(required), `manifesto signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /Am I a madman or messiah[^]*not evidence about mortality, a social prediction, or medical advice/i, 'timeline should pair the manifesto with its boundary');

    const dontDieSource = readFileSync(new URL('../src/content/knowledge/dont-die.md', import.meta.url), 'utf8');
    assert.match(dontDieSource, /On October 6, Johnson published the movement’s origin-story manifesto[^]*World as Will and Representation[^]*not evidence about mortality, a social prediction, or medical advice/i, 'dont-die page should record the manifesto with its boundary');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /Later on October 6[^]*Schopenhauer’s marksman[^]*he would have been 36[^]*a social prediction, or medical advice/i, 'bryan-johnson page should record the manifesto within the coda paragraph');
  });

  it('publishes the October 6 creatine-critique quote-post with trial-design facts verified and the mechanism marked asserted', () => {
    for (const required of [
      'creatine-rct-measurement-critique',
      '2107516394418147828',
      'https://x.com/bryan_johnson/status/2107516394418147828',
      'https://x.com/morellifit/status/2107166825377362034',
      '2.43 lbs',
      '0.31 lbs',
      '10.1080/15502783.2026.2716273',
      'ISRCTN83081058',
      'Chun, Kreider et al.',
      'chose their exercise arm',
      'randomized double-blind to 10 g/day creatine monohydrate or maltodextrin placebo',
      'DEXA genuinely cannot separate muscle protein from water',
      'a mechanism asserted as a finding',
      'the same no-exercise creatine arm also increased 1RM strength',
      'lean-mass CI 0.2–2.0 kg',
      'not a determination of what the lean-mass gain consisted of, a creatine recommendation or warning, or medical advice',
      "confidence: 'medium'",
    ]) {
      assert.ok(signalsSource.includes(required), `creatine signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /water-retention critique[^]*not a determination of what the lean-mass gain consisted of[^]*or medical advice/i, 'timeline should pair the creatine critique with its boundary');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /Later on October 6[^]*10[.]1080\/15502783[.]2026[.]2716273[^]*a mechanism asserted as a finding[^]*a creatine recommendation or warning/i, 'bryan-johnson page should record the creatine critique with verified context');
  });

  it('rotates audit-window and site-content counters for the October 7 pass', () => {
    assert.match(signalsSource, /50 Sep 11–Oct 6 posts reviewed last pass via read-only bird user-tweets gap-fill audit/, 'audit window should carry the demoted October 7 label');
    assert.match(signalsSource, /12 knowledge pages \+ 82 update pages/, 'site content count should include the new update page');
    assert.match(signalsSource, /4 sources matched last pass · Schopenhauer WWR Vol[.] II marksman passage/, 'studies-verified counter should cover this pass');
    assert.match(signalsSource, /7 sources matched earlier pass · FDA zolpidem label/, 'prior studies-verified counter should carry the October 6 label');
    assert.match(signalsSource, /\{ date: '2026-10-07', x_post: 3/, 'curated activity should recount the October 7 status-games feed');
    assert.match(signalsSource, /\{ date: '2026-10-06', x_post: 8/, 'curated activity should recount the full October 6 feed');

    const updatePage = readFileSync(new URL('../src/content/updates/2026-10-07-manifesto-creatine-critique-curation.md', import.meta.url), 'utf8');
    assert.match(updatePage, /50 posts spanning September 11–October 6/, 'update page should document the audit window');
    assert.match(updatePage, /last covered post: October 6, 00:16 UTC/, 'update page should document the gap-fill starting point');
    assert.match(updatePage, /seven posts newer than the last covered post, two of them substantive/, 'update page should document the gap tally');
    assert.match(updatePage, /10[.]1080\/15502783[.]2026[.]2716273/, 'update page should document the creatine RCT verification');
    assert.match(updatePage, /participants chose their exercise arm/, 'update page should document the design verification');
    assert.match(updatePage, /Schopenhauer footnote/, 'update page should document the quotation verification');
    assert.match(updatePage, /Skipped as chronology-only[^]*filters, retouch and lighting/s, 'update page should document the skip decisions');
  });

  it('publishes the October 7 health-as-status cluster with verified status-literature context and the 75,000 threshold bounded', () => {
    for (const required of [
      'health-as-status-games-cluster',
      '2107825420435644527',
      'https://x.com/bryan_johnson/status/2107825420435644527',
      'https://x.com/bryan_johnson/status/2107867680355274830',
      'https://x.com/bryan_johnson/status/2107891916801191989',
      'https://x.com/cz_binance/status/2107728165242302902',
      'compete on health, not wealth rankings or lambos',
      'health is the premium status symbol',
      '75,000 similarly powerful people',
      '10.1126/science.aas8827',
      'roughly 25% of small interacting populations',
      'a fraction of a bounded group, not an absolute count of global elites',
      'not expected to be a universal value',
      'born September 10, 1977',
      'dominance–prestige account',
      'JPSP 104(1), 2013',
      'not a demonstrated social trend, a validated adoption threshold, or medical advice',
      "confidence: 'medium'",
    ]) {
      assert.ok(signalsSource.includes(required), `status-games signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /health is the premium status symbol[^]*not a demonstrated social trend, a validated adoption threshold, or medical advice/i, 'timeline should pair the status-games cluster with its boundary');

    const dontDieSource = readFileSync(new URL('../src/content/knowledge/dont-die.md', import.meta.url), 'utf8');
    assert.match(dontDieSource, /On October 7, the ideology turned to status games[^]*10[.]1126\/science[.]aas8827[^]*not a demonstrated social trend, a validated adoption threshold, or medical advice/i, 'dont-die page should record the status-games cluster with its boundary');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /On October 7, the feed produced a three-post status-games cluster[^]*dominance–prestige account[^]*a validated adoption threshold, or medical advice/i, 'bryan-johnson page should record the status-games cluster within the chronology');
  });

  it('publishes the October 8 Axios/status/childhood-decline cluster with verified interview and CDC/SEARCH context', () => {
    for (const required of [
      'axios-shame-arbitrage-cluster',
      '2108212258312712198',
      'https://x.com/bryan_johnson/status/2108212258312712198',
      'https://x.com/bryan_johnson/status/2108214598864413175',
      'https://x.com/bryan_johnson/status/2108306478788649121',
      'https://x.com/micsolana/status/2107962976246669595',
      'The shame arbitrage press used against me for years is now eliminated',
      'Axios rolled with it',
      'You can just do things',
      'another high status signal',
      'if we don’t get the AI apocalypse the average human lifespan maybe jumps to like 500 years',
      'They’re in biological decline before their parents',
      '10.0% (1988–1994) → 21.1% (Aug 2021–Aug 2023)',
      '5.31%/yr (95% CI 4.46–6.17)',
      '10.1016/S2213-8587(23)00025-6',
      'Mike Solana (Founders Fund CMO and Pirate Wires founder)',
      'the obesity “doubling” is prevalence, not incidence, and the series compares survey waves, not continuous measurement',
      'not a demonstrated status shift, a life-expectancy forecast, a pediatric-health directive, or medical advice',
      "confidence: 'medium'",
    ]) {
      assert.ok(signalsSource.includes(required), `Axios/status signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /shame arbitrage press used against me for years is now eliminated[^]*not a demonstrated status shift, a life-expectancy forecast, a pediatric-health directive, or medical advice/i, 'timeline should pair the Axios/status cluster with its boundary');

    const dontDieSource = readFileSync(new URL('../src/content/knowledge/dont-die.md', import.meta.url), 'utf8');
    assert.match(dontDieSource, /On October 8, the status arc acquired its first mainstream-media validation[^]*10[.]1016\/S2213-8587\(23\)00025-6[^]*not a demonstrated status shift, a life-expectancy forecast, a pediatric-health directive, or medical advice/i, 'dont-die page should record the Axios/status cluster with its boundary');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /On October 8, the feed produced a three-post cluster[^]*Founders Fund CMO, Pirate Wires founder[^]*a pediatric-health directive, or medical advice/i, 'bryan-johnson page should record the Axios/status cluster within the chronology');
  });

  it('rotates audit-window and site-content counters for the October 9 pass', () => {
    assert.match(signalsSource, /50 Sep 18–Oct 9 posts reviewed last pass/, 'audit window should carry the demoted October 9 label');
    assert.match(signalsSource, /12 knowledge pages \+ 82 update pages/, 'site content count should include the new update page');
    assert.match(signalsSource, /4 sources matched last pass · Princeton III ED-precedes-CVD consensus/, 'sources-verified counter should carry the demoted October 9 label');
    assert.match(signalsSource, /4 sources matched last pass · Axios October 8 interview coverage/, 'prior sources-verified counter should carry the October 9 label');
    assert.match(signalsSource, /\{ date: '2026-10-10', x_post: 1/, 'curated activity should include the October 10 site row');
    assert.match(signalsSource, /\{ date: '2026-10-09', x_post: 3/, 'curated activity should recount the October 9 feed');

    const updatePage = readFileSync(new URL('../src/content/updates/2026-10-10-female-nte-sleep-duration-curation.md', import.meta.url), 'utf8');
    assert.match(updatePage, /50 posts spanning September 18–October 9/, 'update page should document the audit window');
    assert.match(updatePage, /last covered post: October 8, 21:20 UTC, the childhood-decline statistics post/, 'update page should document the starting point');
    assert.match(updatePage, /three posts newer than the last covered post, all from October 9, forming two substantive arcs/, 'update page should document the gap tally');
    assert.match(updatePage, /PMC3498391/, 'update page should document the Princeton III verification');
    assert.match(updatePage, /10[.]1007\/BF01541556/, 'update page should document the Fisher 1983 verification');
    assert.match(updatePage, /28346153/, 'update page should document the NSF efficiency verification');
    assert.match(updatePage, /PMC4442216/, 'update page should document the AASM/SRS duration-consensus verification');
    assert.match(updatePage, /No skip decisions were needed this pass/, 'update page should document the absence of skip decisions');
  });

  it('publishes the October 9 female-NTE cluster as an attributed program-extension claim with bounded literature context', () => {
    for (const required of [
      'female-nte-measurement-extension',
      '2108705219941183934',
      '2108705788986634435',
      'https://x.com/bryan_johnson/status/2108705788986634435',
      'I am measuring my girlfriend’s erections',
      'Erections are a Tier-1 health marker',
      '2-5 years before heart symptoms',
      'The clitoris is erectile tissue, same as men',
      '$15,723.68',
      'one of 1,900 biomarkers she’s tracking across her menstrual cycle',
      'Princeton III/IV consensus',
      'Karacan et al. (1970)',
      'Fisher et al. (1983',
      '10.1007/BF01541556',
      '95% of REM periods',
      'no published study links female nocturnal engorgement to cardiovascular outcomes',
      'not a validated female health-risk tool, a monitoring recommendation, or medical advice',
      "confidence: 'medium'",
    ]) {
      assert.ok(signalsSource.includes(required), `female-NTE signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /I am measuring my girlfriend’s erections[^]*not a validated female health-risk tool, a reader sleep prescription, or medical advice/i, 'timeline should pair the female-NTE cluster with its boundary');

    const biomarkerProtocolsSource = readFileSync(new URL('../src/content/knowledge/biomarker-driven-longevity-protocols.md', import.meta.url), 'utf8');
    assert.match(biomarkerProtocolsSource, /On October 9[^]*10[.]1007\/BF01541556[^]*not a validated female health-risk tool, a monitoring recommendation, or medical advice/i, 'biomarker-protocols page should keep the female-NTE claim and its boundary together');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /On October 9[^]*Karacan et al[.]+ \(1970\)[^]*not a validated female health-risk tool, a reader sleep prescription, or medical advice/i, 'bryan-johnson page should record the October 9 arcs with their boundary');

    assert.match(protocolsSource, /female nighttime-erection measurement announcement as an attributed N=1 program-extension claim[^]*Karacan et al[.]+ 1970[^]*Fisher et al[.]+ 1983[^]*not a monitoring recommendation for readers/, 'health protocol guidance should keep the female-NTE claim in the attributed lane');
  });

  it('publishes the October 9 sleep-duration guidance with the consensus floor noted', () => {
    for (const required of [
      'sleep-duration-time-in-bed-guidance',
      '2108530005596877045',
      'https://x.com/bryan_johnson/status/2108530005596877045',
      '6.5-7.5 hr of sleep is ideal',
      '85-90% efficiency',
      'self reported from questionnaire',
      '8 hrs was a psyop',
      'BowTiedPhys',
      'National Sleep Foundation’s 2017 consensus',
      '28346153',
      '7 or more hours per night',
      'Watson et al., 2015',
      'not a reader sleep prescription or medical advice',
      "confidence: 'medium'",
    ]) {
      assert.ok(signalsSource.includes(required), `sleep-duration signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /6[.]5-7[.]5 hr of sleep is ideal[^]*not a validated female health-risk tool, a reader sleep prescription, or medical advice/i, 'timeline should pair the sleep-duration guidance with its boundary');

    assert.match(protocolsSource, /sleep-duration guidance as attributed, not prescriptive[^]*28346153[^]*7 or more hours per night/, 'sleep protocol guidance should keep the duration claim in the attributed lane');
    assert.match(protocolsSource, /label: 'Sleep duration'/, 'sleep protocol dossier should carry a sleep-duration card');
  });

  it('rotates audit-window and site-content counters for the October 13 pass', () => {
    assert.match(signalsSource, /50 Sep 24–Oct 14 posts reviewed last pass/, 'audit window should carry the demoted October 13 label');
    assert.match(signalsSource, /12 knowledge pages \+ 82 update pages/, 'site content count should include the new update page');
    assert.match(signalsSource, /4 sources matched last pass · UCL Newman Ig Nobel announcement/, 'prior sources-verified counter should carry the demoted October 13 label');
    assert.match(signalsSource, /4 sources matched last pass · Princeton III ED-precedes-CVD consensus/, 'older sources-verified counter should carry the demoted October 9 label');
    assert.match(signalsSource, /\{ date: '2026-10-14', x_post: 3/, 'curated activity should recount the October 14 feed');
    assert.match(signalsSource, /\{ date: '2026-10-13', x_post: 2/, 'curated activity should recount the October 13 feed');

    const updatePage = readFileSync(new URL('../src/content/updates/2026-10-14-blue-zones-claim-curation.md', import.meta.url), 'utf8');
    assert.match(updatePage, /50 posts spanning September 24–October 14/, 'update page should document the audit window');
    assert.match(updatePage, /last covered post: October 9, 23:46 UTC, the female-NTE protocol post/, 'update page should document the starting point');
    assert.match(updatePage, /ten posts newer than the last covered post \(October 10–14\), one substantive/, 'update page should document the gap tally');
    assert.match(updatePage, /Ig Nobel/, 'update page should document the Newman Ig Nobel verification');
    assert.match(updatePage, /NZZ/, 'update page should document the NZZ interview verification');
    assert.match(updatePage, /Skipped as chronology-only or engagement banter/, 'update page should document the skip decisions');
  });

  it('rotates audit-window and site-content counters for the October 19 pass', () => {
      assert.match(signalsSource, /50 Oct 7–20 posts reviewed last pass via read-only bird user-tweets audit/, 'audit window should carry the demoted October 20 label');
      assert.match(signalsSource, /12 knowledge pages \+ 82 update pages/, 'site content count should include the new update page');
      assert.match(signalsSource, /3 sources matched last pass · October 19 women’s-health executive order/, 'sources-verified counter should carry the demoted October 20 label');
      assert.match(signalsSource, /\{ date: '2026-10-21', x_post: 11/, 'curated activity should recount the October 21 feed');
      assert.match(signalsSource, /\{ date: '2026-10-20', x_post: 9/, 'curated activity should recount the October 20 feed');

      const updatePage = readFileSync(new URL('../src/content/updates/2026-10-20-energy-ledger-womens-health-eo-curation.md', import.meta.url), 'utf8');
      assert.match(updatePage, /50 posts spanning October 7–20/, 'update page should document the audit window');
      assert.match(updatePage, /eight posts newer than the last covered window — seven on October 19 and one on October 20/, 'update page should document the gap tally');
      assert.match(updatePage, /ten device line items sum to exactly 52 kWh/, 'update page should document the energy-arithmetic verification');
      assert.match(updatePage, /EIA’s residential references put the average US household at about 10,500 kWh/, 'update page should document the household-consumption verification');
      assert.match(updatePage, /“Advancing Women’s Health to Improve Outcomes in All Phases of Life,” signed October 19, 2026/, 'update page should document the executive-order verification');
      assert.match(updatePage, /No White House or HHS material mentions Johnson or his campaign/, 'update page should document the implied-credit boundary');
      assert.match(updatePage, /Skipped as low-signal\/banter/, 'update page should document the skip decisions');
    });

    it('publishes the October 19 energy ledger and women’s-health EO cluster as attributed disclosures with verified context', () => {
      for (const required of [
        'longevity-home-energy-footprint',
        '2112320547828945248',
        'endo-program-womens-health-eo',
        '2112262101385568357',
        'https://x.com/bryan_johnson/status/2112320547828945248',
        'https://x.com/bryan_johnson/status/2112262101385568357',
        'https://www.eia.gov/energyexplained/use-of-energy/electricity-use-in-homes.php',
        'https://www.whitehouse.gov/presidential-actions/2026/10/advancing-womens-health-to-improve-outcomes-in-all-phases-of-life/',
        'https://www.hhs.gov/press-room/trump-flotus-womens-health-executive-order-new-nih-division.html',
        'What it takes to power my longevity home for 1 day',
        '52 kWh for longevity',
        '93 kWh for whole house',
        '64 kWh solar generation',
        '33 kWh exported to the grid',
        'the ten device line items sum to exactly 52 kWh',
        'average US household consumes about 10,500 kWh of electricity per year',
        'about 3.2× an average household',
        'about 1.8× an average American home',
        'assumes a ~12.5 Wh battery',
        'you’re welcome',
        'establishes a Women’s Health Division within NIH within 90 days',
        'No White House or HHS material mentions Johnson or his campaign',
        'not an efficiency standard readers should copy, evidence the devices improve health, or medical advice',
        'not evidence of influence, a policy endorsement, or medical advice',
        "confidence: 'medium'",
      ]) {
        assert.ok(signalsSource.includes(required), `October 19 signals should preserve: ${required}`);
      }

      assert.match(dashboardSectionsSource, /On October 19[^]*52 kWh for longevity[^]*not an efficiency standard, evidence of policy influence, a sleep-performance verdict, or medical advice/i, 'timeline should pair the October 19 disclosures with their boundary');

      const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
      assert.match(bryanJohnsonSource, /On October 19[^]*52 kWh for longevity[^]*not an efficiency standard readers should copy, evidence of policy influence, or medical advice/i, 'bryan-johnson page should record the October 19 disclosures with their boundary');

      assert.match(protocolsSource, /longevity-home energy ledger[^]*EIA average-US-household ~29 kWh\/day[^]*implies nothing about whether any listed device affects longevity outcomes/, 'health protocol guidance should keep the energy ledger in the attributed lane');
      assert.match(protocolsSource, /label: 'Longevity-home energy ledger'/, 'health protocol dossier should carry an energy-ledger card');

      assert.match(signalsSource, /Watch whether Johnson publishes the actual intervention[^]*October 19 policy context: the new women’s-health executive order names endometriosis[^]*Attributed program-intent tracking, not cure evidence or medical advice/, 'watch item should track the EO as context without converting it to validation');
    });

  it('rotates audit-window and site-content counters for the October 20 pass', () => {
      assert.match(signalsSource, /50 Oct 9–21 posts reviewed last pass via read-only bird user-tweets audit/, 'audit window should cover this pass');
      assert.match(signalsSource, /12 knowledge pages \+ 82 update pages/, 'site content count should include the new update page');
      assert.match(signalsSource, /4 sources matched last pass · Veradermics Phase 3 ‘304’ topline/, 'sources-verified counter should cover this pass');
      assert.match(signalsSource, /\{ date: '2026-10-21', x_post: 11/, 'curated activity should recount the October 21 feed');
      assert.match(signalsSource, /\{ date: '2026-10-20', x_post: 9/, 'curated activity should recount the October 20 feed');

      const updatePage = readFileSync(new URL('../src/content/updates/2026-10-21-rapamycin-minoxidil-curation.md', import.meta.url), 'utf8');
      assert.match(updatePage, /50 posts spanning October 9–21/, 'update page should document the audit window');
      assert.match(updatePage, /thirteen posts newer than the last covered item — nine on October 20 and four on October 21/, 'update page should document the gap tally');
      assert.match(updatePage, /September 28, 2024 decision ended almost five years of dosing/, 'update page should document the rapamycin-record verification');
      assert.match(updatePage, /Lancet Healthy Longevity systematic review/, 'update page should document the peer-reviewed-skepticism verification');
      assert.match(updatePage, /28[.]6 QD \/ 36[.]4 BID vs 6[.]6 placebo hairs\/cm²/, 'update page should document the Phase 3 topline verification');
      assert.match(updatePage, /Panchaprateep and Luengarun’s open-label study of 30 men/, 'update page should document the 35.9 comparator verification');
      assert.match(updatePage, /cross-trial, not head-to-head/, 'update page should document the comparability boundary');
      assert.match(updatePage, /america by design launch/, 'update page should document the road-trip context');
      assert.match(updatePage, /Skipped as low-signal\/chronology/, 'update page should document the skip decisions');
    });

    it('publishes the October 20 rapamycin retrospective and minoxidil Phase 3 comparison as attributed claims with verified context', () => {
      for (const required of [
        'rapamycin-discontinuation-retrospective',
        '2112642762353021020',
        'minoxidil-phase3-pharmacy-positioning',
        '2112558564216868987',
        'https://x.com/bryan_johnson/status/2112642762353021020',
        'https://x.com/bryan_johnson/status/2112558564216868987',
        'https://blueprint.bryanjohnson.com/blogs/news/i-stopped-taking-rapamycin',
        'https://www.thelancet.com/journals/lanhl/article/PIIS2666-7568(23)0258-1/fulltext',
        'https://ir.veradermics.com/news-releases/news-release-details/veradermics-oral-vdphl01-achieved-early-consistent-and-robust-0',
        'https://jamanetwork.com/journals/jamadermatology/fullarticle/2817326',
        'Rapamycin was the undisputed king of longevity drugs',
        'September 28, 2024 decision ended almost five years',
        'intermittent skin/soft-tissue infections, lipid abnormalities, glucose elevations, and increased resting heart rate',
        'no significant endocrine, muscular, or neurological effects',
        '36.4 hairs/cm²',
        '35.9 hairs/cm²',
        '28.6 (QD) and 36.4 (BID) hairs/cm² vs 6.6 for placebo',
        'Panchaprateep and Luengarun’s open-label study of 30 men',
        'the comparison is cross-trial, not head-to-head',
        'available now at my Immortals Pharmacy',
        'I personally take 3.5 mg daily',
        'off-label prescribing territory requiring clinician oversight',
        'not deprescribing guidance, a validation of his biomarker-driven method, or medical advice',
        'not a hair-loss treatment recommendation, evidence of equivalence between the two drugs, or medical advice',
        "confidence: 'medium'",
      ]) {
        assert.ok(signalsSource.includes(required), `October 20 signals should preserve: ${required}`);
      }

      assert.match(dashboardSectionsSource, /On October 20|rapamycin reversal gets its victory lap/i, 'timeline should carry the October 20 row');
      assert.match(dashboardSectionsSource, /rapamycin reversal gets its victory lap[^]*not deprescribing guidance, evidence of drug equivalence, evidence of political influence, or medical advice/i, 'timeline should pair the October 20 claims with their boundary');

      const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
      assert.match(bryanJohnsonSource, /On October 20[^]*Rapamycin was the undisputed king[^]*not deprescribing guidance, evidence of drug equivalence, evidence of political influence, or medical advice/i, 'bryan-johnson page should record the October 20 claims with their boundary');

      assert.match(protocolsSource, /rapamycin-retrospective post as an attributed N=1 deprescribing narrative[^]*None of this tells any other person to stop or start rapamycin/, 'health protocol guidance should keep the rapamycin retrospective in the attributed lane');
      assert.match(protocolsSource, /minoxidil Phase 3 comparison as competitive pharmacy marketing[^]*Not evidence of drug equivalence or a hair-loss treatment recommendation/, 'health protocol guidance should keep the minoxidil comparison in the attributed lane');
      assert.match(protocolsSource, /label: 'Rapamycin reversal retrospective'/, 'health protocol dossier should carry a rapamycin card');
      assert.match(protocolsSource, /label: 'Minoxidil Phase 3 comparison'/, 'health protocol dossier should carry a minoxidil card');
    });

    it('publishes the October 21 peptide-safety relay and N-of-1 self-critique as attributed claims with verified context', () => {
      for (const required of [
        'gray-market-peptide-safety-relay',
        '2113024548643996051',
        'nof1-biomarker-limits-endorsement',
        '2112735624684093647',
        'https://x.com/bryan_johnson/status/2113024548643996051',
        'https://x.com/bryan_johnson/status/2112735624684093647',
        'https://www.trmlabs.com/resources/blog/americans-are-buying-peptides-from-the-same-chinese-chemical-vendors-selling-fentanyl-precursors-sales-up-32-since-2023',
        'https://www.wsj.com/health/pharma/chinese-makers-of-fentanyl-ingredients-now-sell-bootleg-peptides-to-americans-c383160b',
        'https://www.cbsnews.com/news/deaths-reported-fda-bootleg-reta-weight-loss-drug/',
        'https://www.cell.com/cell/fulltext/S0092-8674(23)00857-7',
        'Your peptides may be coming',
        'Anhui Renchen Technology was indicted in 2023',
        'roughly 200 Chinese firms TRM Labs tracked selling fentanyl precursors, at least 50 now sell peptides',
        'master cartons',
        '130,000 vials',
        'two deaths, one in July and one in September',
        'the first public US death reports linked to bootleg retatrutide',
        'TRM cannot separate peptide revenue from precursor revenue',
        'my biomarker numbers say less than people think',
        'blind men touching the elephant',
        'responsiveness but not durability; optimisation but not causality',
        'a simulation of aging system dynamics',
        'the paper is not identified in the post and is not linked',
        'not evidence that biomarker tracking is useless, a disclosed research program, or medical advice',
        'not purchasing guidance, an indictment of all peptide use, evidence that regulated alternatives are risk-free, or medical advice',
        "confidence: 'medium'",
      ]) {
        assert.ok(signalsSource.includes(required), `October 21 signals should preserve: ${required}`);
      }

      assert.match(dashboardSectionsSource, /N=1 gets its self-critique[^]*not evidence against biomarker tracking, a sanctioned self-experiment, purchasing guidance, a sauna protocol readers can copy, or medical advice/i, 'timeline should pair the October 21 claims with their boundary');

      const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
      assert.match(bryanJohnsonSource, /On October 21[^]*my biomarker numbers say less than people think[^]*not evidence against biomarker tracking, a sanctioned self-experiment, purchasing guidance, a sauna protocol readers can copy, or medical advice/i, 'bryan-johnson page should record the October 21 claims with their boundary');

      assert.match(protocolsSource, /gray-market peptide warning as a verified consumer-safety relay[^]*Not an indictment of all peptide use/, 'health protocol guidance should keep the peptide warning in the attributed lane');
      assert.match(protocolsSource, /N=1 self-critique as an attributed epistemic-boundary statement[^]*Not evidence biomarker tracking is useless/, 'health protocol guidance should keep the N-of-1 critique in the attributed lane');
      assert.match(protocolsSource, /GLP-1 gut self-experiment announcement as intent without a protocol[^]*Not a sanctioned self-experiment/, 'health protocol guidance should keep the GLP-1 announcement in the attributed lane');
      assert.match(protocolsSource, /sauna equipment-and-rationale disclosure as attributed N=1 practice[^]*not a reader protocol/, 'health protocol guidance should keep the sauna disclosure in the attributed lane');
      assert.match(protocolsSource, /label: 'Gray-market peptide warning'/, 'health protocol dossier should carry a peptide-warning card');
      assert.match(protocolsSource, /label: 'N=1 self-critique'/, 'health protocol dossier should carry an N-of-1 card');
      assert.match(protocolsSource, /label: 'GLP-1 gut self-experiment'/, 'health protocol dossier should carry a GLP-1 card');
      assert.match(protocolsSource, /label: 'Sauna protocol disclosure'/, 'health protocol dossier should carry a sauna card');
    });

    it('rotates audit-window and site-content counters for the October 21 pass', () => {
      assert.match(signalsSource, /50 Oct 13–22 posts reviewed last pass via read-only bird user-tweets audit/, 'audit window should cover this pass');
      assert.match(signalsSource, /12 knowledge pages \+ 82 update pages/, 'site content count should include the new update page');
      assert.match(signalsSource, /4 sources matched last pass · TRM Labs October 6 peptide\/fentanyl-precursor blockchain analysis/, 'sources-verified counter should cover this pass');
      assert.match(signalsSource, /\{ date: '2026-10-22', x_post: 5/, 'curated activity should recount the October 22 feed');
      assert.match(signalsSource, /\{ date: '2026-10-21', x_post: 11/, 'curated activity should recount the October 21 feed');

      const updatePage = readFileSync(new URL('../src/content/updates/2026-10-22-peptide-warning-nof1-critique-curation.md', import.meta.url), 'utf8');
      assert.match(updatePage, /50 posts spanning October 13–22/, 'update page should document the audit window');
      assert.match(updatePage, /nine posts newer than the last covered boundary — eight on October 21 and one on October 22/, 'update page should document the gap tally');
      assert.match(updatePage, /TRM Labs’ October 6 blockchain analysis/, 'update page should document the TRM verification');
      assert.match(updatePage, /130,000\+ vials nationally October 2025–August 2026/, 'update page should document the CBP verification');
      assert.match(updatePage, /CBS News’ October 13 report of the two FAERS retatrutide death reports/, 'update page should document the death-report verification');
      assert.match(updatePage, /Koehler et al\., Cell Reports Medicine/, 'update page should document the GLP-1 study verification');
      assert.match(updatePage, /the paper is unnamed and unlinked/, 'update page should document the unnamed-paper boundary');
      assert.match(updatePage, /Skipped as low-signal\/chronology/, 'update page should document the skip decisions');
    });

    it('publishes the October 22 hearing-protection directive as an attributed claim with verified context', () => {
      for (const required of [
        'hearing-protection-earplug-advice',
        '2113385315801199010',
        'https://x.com/bryan_johnson/status/2113385315801199010',
        'https://pubmed.ncbi.nlm.nih.gov/24412398/',
        'https://doi.org/10.1016/S0140-6736(24)01296-0',
        'Take earplugs everywhere',
        'Can’t currently fix hearing loss',
        'Hearing loss accelerates brain volume loss and cognitive decline',
        'Lin et al. (NeuroImage, 2014, 10.1016/j.neuroimage.2013.12.059)',
        '8.4 vs 7.2 cm³/year',
        'right temporal lobe',
        '2024 Lancet Commission',
        'HR 1.37',
        '17% lower dementia risk',
        'ACHIEVE',
        'ARIC subgroup',
        'routinely above 85 dBA” venue list runs ahead of the measured record',
        '80.4 dBA',
        '77–78 dBA',
        'no trial shows earplugs prevent cognitive decline',
        'not a reader audiology recommendation, a venue-by-venue noise assessment, evidence that earplug use prevents dementia, or medical advice',
        "confidence: 'medium'",
      ]) {
        assert.ok(signalsSource.includes(required), `October 22 signals should preserve: ${required}`);
      }

      assert.match(dashboardSectionsSource, /Take earplugs everywhere[^]*not a reader audiology recommendation, evidence of youthful equivalence, evidence that earplug use prevents dementia, a tested physiological loop, or medical advice/i, 'timeline should pair the October 22 claims with their boundary');

      const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
      assert.match(bryanJohnsonSource, /On October 22[^]*Take earplugs everywhere[^]*not a reader audiology recommendation, evidence of youthful equivalence, evidence that earplug use prevents dementia, a tested physiological loop, or medical advice/i, 'bryan-johnson page should record the October 22 claims with their boundary');

      assert.match(protocolsSource, /“Take earplugs everywhere” post as an attributed prevention directive[^]*not a hearing-protection prescription or medical advice/, 'health protocol guidance should keep the hearing directive in the attributed lane');
      assert.match(protocolsSource, /label: 'Hearing-protection directive'/, 'health protocol dossier should carry a hearing-protection card');
    });

    it('rotates audit-window and site-content counters for the October 22 pass', () => {
      assert.match(signalsSource, /50 Oct 14–22 posts reviewed last pass via read-only bird user-tweets audit/, 'audit window should carry the demoted October 22 label');
      assert.match(signalsSource, /12 knowledge pages \+ 82 update pages/, 'site content count should include the new update page');
      assert.match(signalsSource, /3 sources matched last pass · Lin et al\. NeuroImage 2014 BLSA hearing\/brain-atrophy study/, 'sources-verified counter should carry the demoted October 22 label');
      assert.match(signalsSource, /\{ date: '2026-10-23', x_post: 0/, 'curated activity should include the October 23 site row');
      assert.match(signalsSource, /\{ date: '2026-10-22', x_post: 5/, 'curated activity should recount the October 22 feed');

      const updatePage = readFileSync(new URL('../src/content/updates/2026-10-23-hearing-earplug-directive-curation.md', import.meta.url), 'utf8');
      assert.match(updatePage, /50 posts spanning October 14–22/, 'update page should document the audit window');
      assert.match(updatePage, /four posts newer than the last covered boundary/, 'update page should document the gap tally');
      assert.match(updatePage, /Lin et al\., NeuroImage 2014/, 'update page should document the BLSA verification');
      assert.match(updatePage, /2024 Lancet Commission ranks hearing loss/, 'update page should document the Lancet Commission verification');
      assert.match(updatePage, /2,376-venue SoundPrint restaurant survey/, 'update page should document the restaurant-noise verification');
      assert.match(updatePage, /no trial shows earplugs prevent cognitive decline/, 'update page should document the intervention-evidence boundary');
      assert.match(updatePage, /Skipped as low-signal\/chronology/, 'update page should document the skip decisions');
    });

    it('publishes the October 24 bone-pressure lifespan claim as an attributed claim whose figure Johnson self-corrected the same day', () => {
      for (const required of [
        'bone-pressure-lifespan-claim',
        '2113804913188983076',
        'https://x.com/bryan_johnson/status/2113804913188983076',
        'Mechanical pressure on shin bones extended mouse lifespan by 80 days',
        'human equivalent of 7–9 yrs',
        'anti-aging juice',
        'Zhao et al., Aging Cell 2026',
        '10.1111/acel.70687',
        'Cai et al., Nature Neuroscience',
        '10.1038/s41593-026-02422-w',
        '10.64898/2026.07.05.736555',
        'Selman et al., Science 2009',
        '10.1126/science.1177221',
        '862→942 days',
        '10.7554/eLife.49631',
        'no lifespan endpoint',
        'not jumping',
        'not evidence that jumping or dunk training extends life, a reader exercise prescription, or medical advice',
        'Here is the correct paper for the stats in the original post',
        'anabolic prostaglandin E2',
        'Bai et al.',
        'Dynamic force sensing by bone delays aging and extends lifespan',
        'Cell Metabolism',
        '10.1016/j.cmet.2026.09.020',
        '9.4%/79.5 days',
        'published online October 23, 2026',
        'https://x.com/bryan_johnson/status/2113992318206497133',
        "confidence: 'medium'",
      ]) {
        assert.ok(signalsSource.includes(required), `October 24 signals should preserve: ${required}`);
      }

      assert.match(dashboardSectionsSource, /bone-mechanosensing longevity claim[^]*not evidence that jumping or dunk training extends life, a reader exercise prescription, or medical advice/i, 'timeline should pair the October 24 claim with its boundary');

      const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
      assert.match(bryanJohnsonSource, /On October 24[^]*Mechanical pressure on shin bones[^]*not evidence that jumping or dunk training extends life, a reader exercise prescription, or medical advice/i, 'bryan-johnson page should record the October 24 claim with its boundary');

      assert.match(protocolsSource, /bone-pressure lifespan post as an attributed research claim that self-corrected the same day[^]*Not evidence that jumping or dunk training extends life, a reader exercise prescription, or medical advice/, 'longevity protocol guidance should keep the bone claim in the attributed lane');
      assert.match(protocolsSource, /label: 'Bone-pressure lifespan claim'/, 'longevity protocol dossier should carry a bone-pressure card');
    });

    it('rotates audit-window and site-content counters for the October 24 pass', () => {
      assert.match(signalsSource, /20 Oct 20–24 posts re-reviewed via read-only bird user-tweets audit/, 'audit window should cover this pass');
      assert.match(signalsSource, /12 knowledge pages \+ 82 update pages/, 'site content count should include the new update page');
      assert.match(signalsSource, /3 sources matched last pass · Bai et al\. Cell Metabolism 2026/, 'sources-verified counter should carry the demoted October 25 label');
      assert.match(signalsSource, /5 sources matched · Zhao et al\. Aging Cell 2026 Piezo1\/Cx43 aged-bone paper/, 'prior-pass sources counter should carry the demoted label');
      assert.match(signalsSource, /\{ date: '2026-10-25', x_post: 3, third_party: 0, wiki_update: 0, site_update: 1/, 'curated activity should include the October 25 site row');
      assert.match(signalsSource, /\{ date: '2026-10-24', x_post: 4/, 'curated activity should recount the October 24 feed');

      const updatePage = readFileSync(new URL('../src/content/updates/2026-10-24-bone-pressure-lifespan-curation.md', import.meta.url), 'utf8');
      assert.match(updatePage, /20 posts spanning October 20–24/, 'update page should document the audit window');
      assert.match(updatePage, /one post newer than the last covered boundary/, 'update page should document the gap tally');
      assert.match(updatePage, /Cai et al\. \(Nature Neuroscience/, 'update page should document the bone–brain axis verification');
      assert.match(updatePage, /identified by OCR of the tweet image/, 'update page should document the screenshot identification');
      assert.match(updatePage, /Selman et al\. \(Science 2009/, 'update page should document the S6K1 figure mismatch');
      assert.match(updatePage, /external ~15×-body-weight tibial compression device, not jumping/, 'update page should document the protocol mismatch');
      assert.match(updatePage, /the post is 21 minutes old/, 'update page should document the recency boundary');
    });

    it('publishes the October 25 self-correction pass with the resolved figure and rotated counters', () => {
      const correctionPage = readFileSync(new URL('../src/content/updates/2026-10-25-bone-pressure-correction-curation.md', import.meta.url), 'utf8');
      assert.match(correctionPage, /three posts newer than the last covered boundary/, 'correction page should document the gap tally');
      assert.match(correctionPage, /Here is the correct paper for the stats in the original post/, 'correction page should quote the self-correction');
      assert.match(correctionPage, /Bai et al\., “Dynamic force sensing by bone delays aging and extends lifespan,” Cell Metabolism/, 'correction page should identify the resolved paper');
      assert.match(correctionPage, /10\.1016\/j\.cmet\.2026\.09\.020/, 'correction page should cite the DOI');
      assert.match(correctionPage, /coincidence, not source/, 'correction page should close out the Selman match');
      assert.match(correctionPage, /12 knowledge pages \+ 79 update pages/, 'correction page should carry the rotated site-content count');

      const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
      assert.match(bryanJohnsonSource, /Later on October 24, the story corrected itself[^]*not evidence that jumping or dunk training extends life, a reader exercise prescription, or medical advice/i, 'bryan-johnson page should record the self-correction with its boundary');

      assert.match(dashboardSectionsSource, /self-correction resolves the figure to a Cell Metabolism paper published the day before/, 'timeline label should record the resolution');
      assert.match(protocolsSource, /https:\/\/x\.com\/bryan_johnson\/status\/2113992318206497133/, 'longevity protocol entry should cite the correction reply');
      assert.match(signalsSource, /superseded this pass by the Bai et al\. Cell Metabolism correction/, 'prior-pass counter should note the supersession');
    });

    it('publishes the October 25–26 IL-11, psilocybin, microplastics, and Halloween posts as attributed claims with verified context', () => {
      for (const required of [
        'il11-lifespan-relay-drift',
        '2114834793296978182',
        'https://x.com/bryan_johnson/status/2114834793296978182',
        'https://x.com/RyanBethencourt/status/2114701737307087047',
        'https://x.com/bryan_johnson/status/1813710102308028577',
        'https://doi.org/10.1038/s41586-024-07701-9',
        'Extends the medium lifespan of male mice by 22.5% and 35% in female mice',
        'Widjaja et al.',
        'anti-IL-11 antibody (X203) from 75 weeks until death extended median lifespan 22.5% in males (130.3→159.6 weeks) and 25% in females (117.1→146.4 weeks)',
        'BI 765423',
        'Phase IIa',
        'the paper’s female figure is 25%, not 35%',
        'Johnson’s own July 17, 2024 post',
        'the same class of transcription drift',
        'psilocybin-parkinsons-gdf15-claim',
        '2114361011474215200',
        'https://x.com/bryan_johnson/status/2114361011474215200',
        'https://doi.org/10.1001/jamapsychiatry.2026.2733',
        'https://doi.org/10.1038/s41386-025-02097-0',
        'Another win for psilocybin',
        'GDF15 fell',
        'Bradley, Kelley, et al.',
        'JAMA Psychiatry research letter, published October 21, 2026',
        '9 of 12 gave samples',
        'GDF15 improved sharply right after dosing then lost the gain by longer-term follow-up',
        'single-arm, no control group, all participants knew they were receiving the drug',
        'psychedelic-industry ties',
        'microplastics-prevention-list',
        '2114496819615187026',
        'https://x.com/bryan_johnson/status/2114496819615187026',
        'https://doi.org/10.1021/acs.est.3c00924',
        'https://doi.org/10.1021/acs.est.9b02540',
        'https://doi.org/10.1038/s41538-026-01175-x',
        'how to reduce microplastics',
        'loose leaf tea with stainless mesh',
        '7.4–50.7 g/person-year',
        '11.6 billion microplastics and 3.1 billion nanoplastics per cup',
        '555–2,498 particles/cup vs 0.3–2.4',
        'no study yet demonstrates that reducing these exposures improves human health outcomes',
        'halloween-sugar-war-framing',
        '2114379918213894223',
        'https://x.com/bryan_johnson/status/2114379918213894223',
        'A biological attack is planned for Saturday',
        '600 million pounds',
        'October 31, 2026 falls on a Saturday',
        'not a pediatric dietary directive, evidence that Halloween candy acutely injures children, or medical advice',
        "confidence: 'medium'",
      ]) {
        assert.ok(signalsSource.includes(required), `October 25–26 signals should preserve: ${required}`);
      }

      assert.match(dashboardSectionsSource, /IL-11 lifespan relay misquotes its own Nature paper[^]*not evidence for anti-IL-11 or psilocybin in humans, proof that microplastic exposure reduction improves health, evidence that Halloween candy acutely injures children, or medical advice/i, 'timeline should pair the October 26 cluster with its boundary');

      const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
      assert.match(bryanJohnsonSource, /On October 25 and 26[^]*Extends the medium lifespan[^]*not evidence for anti-IL-11 or psilocybin in humans, proof that microplastic exposure reduction improves health, evidence that Halloween candy acutely injures children, or medical advice/i, 'bryan-johnson page should record the October 25–26 cluster with its boundary');

      assert.match(protocolsSource, /IL-11 lifespan relay as a verified paper carried with a drifted figure[^]*Not evidence for anti-IL-11 in humans, a drug expectancy, or medical advice/, 'longevity protocol guidance should keep the IL-11 relay in the attributed lane');
      assert.match(protocolsSource, /psilocybin-Parkinson’s relay as a real three-day-old letter with every design limitation dropped[^]*Not evidence psilocybin treats Parkinson’s, a psychedelic-use endorsement, or medical advice/, 'health protocol guidance should keep the psilocybin relay in the attributed lane');
      assert.match(protocolsSource, /microplastics-reduction checklist as attributed exposure-reduction guidance[^]*Not a reader purchasing list, proven health-benefit evidence, or medical advice/, 'nutrition protocol guidance should keep the microplastics checklist in the attributed lane');
      assert.match(protocolsSource, /label: 'IL-11 lifespan relay'/, 'longevity protocol dossier should carry an IL-11 card');
    });

    it('rotates audit-window and site-content counters for the October 28 pass', () => {
      assert.match(signalsSource, /50 Oct 19–28 posts reviewed via read-only bird user-tweets audit/, 'audit window should cover this pass');
      assert.match(signalsSource, /2 sources matched · Felizzi/, 'sources-verified counter should cover this pass');
      assert.match(signalsSource, /50 Oct 19–27 posts reviewed last pass via read-only bird user-tweets audit/, 'prior-pass audit window should carry the demoted October 28 label');
      assert.match(signalsSource, /4 sources matched last pass · Hu\/Garcia\/Campen et al\. Toxicological Sciences 2024/, 'prior-pass sources counter should carry the demoted label');
      assert.match(signalsSource, /\{ date: '2026-10-29', x_post: 0, third_party: 0, wiki_update: 0, site_update: 1/, 'curated activity should include the October 29 site row');
      assert.match(signalsSource, /\{ date: '2026-10-28', x_post: 4, third_party: 0, wiki_update: 0, site_update: 1/, 'curated activity should recount the October 28 feed');

      const updatePage = readFileSync(new URL('../src/content/updates/2026-10-29-blue-light-aging-economics-curation.md', import.meta.url), 'utf8');
      assert.match(updatePage, /50 posts spanning October 19–28/, 'update page should document the audit window');
      assert.match(updatePage, /five items newer than the last covered boundary/, 'update page should document the gap tally');
      assert.match(updatePage, /Felizzi, “Economic impact of biomarker-based aging interventions/, 'update page should identify the OCR-resolved paper');
      assert.match(updatePage, /CHF 3,236,195/, 'update page should document the currency drift');
      assert.match(updatePage, /willingness-to-pay construct/, 'update page should document the value-construct boundary');
      assert.match(updatePage, /3\.58-year life-expectancy gain/, 'update page should document the lifespan round-up');
      assert.match(updatePage, /Chang, Aeschbach, Duffy, Czeisler, PNAS 2015/, 'update page should document the blue-light verification');
      assert.match(updatePage, /Skipped as low-signal\/banter/, 'update page should document the skip decisions');
    });

    it('publishes the October 28 blue-light and aging-economics posts as attributed claims with verified context', () => {
      for (const required of [
        'stage-blue-light-sleep-anecdote',
        '2115425155879260599',
        'https://x.com/bryan_johnson/status/2115425155879260599',
        'https://doi.org/10.1073/pnas.1418490112',
        'The lights pointing at the stage were blasting my eyeballs with blue light',
        'we hung out in the dark and it was so much better',
        'suppressed evening melatonin by 55.12%',
        'delayed dim-light melatonin onset by more than 1.5 hours',
        '25.65 vs 15.75 minutes',
        'peaking at 452 nm',
        'aging-economics-wtp-relay',
        '2115443720145223923',
        'https://x.com/bryan_johnson/status/2115443720145223923',
        'https://doi.org/10.3389/fgene.2026.1814599',
        'Slowing aging after the age 50 can add 3.6 yrs of life',
        'is worth $4 million in economic value',
        'Frontiers in Genetics, published October 11, 2026',
        '3.58-year life-expectancy gain',
        'CHF 3,236,195',
        'CHF 1,216,186 survival value plus CHF 2,020,009 health-quality value',
        'willingness-to-pay construct',
        'CHF 131,608 per person over 40 years',
        'CHF 600 twice-yearly DunedinPACE testing',
        'DunedinPACE captures one DNA-methylation axis of aging',
        'not evidence that any available intervention adds 3.6 years of life, a wealth or savings figure, or medical advice',
        'not a measured result, a reader light-exposure protocol, or medical advice',
        "confidence: 'medium'",
      ]) {
        assert.ok(signalsSource.includes(required), `October 28 signals should preserve: ${required}`);
      }

      assert.match(dashboardSectionsSource, /a stage-lights blue-light anecdote extends the sleep streak[^]*not evidence that any available intervention adds 3\.6 years of life, a wealth figure, a reader light-exposure protocol, or medical advice/i, 'timeline should pair the October 28 cluster with its boundary');

      const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
      assert.match(bryanJohnsonSource, /On October 28, the feed slowed to four genuinely new top-level posts[^]*Slowing aging after the age 50 can add 3\.6 yrs of life[^]*not evidence that any available intervention adds 3\.6 years of life, a wealth or savings figure, a reader light-exposure protocol, or medical advice/i, 'bryan-johnson page should record the October 28 cluster with its boundary');

      assert.match(protocolsSource, /aging-economics relay as a real three-week-old modeling paper whose money figure the post both inflates and converts[^]*Not evidence that any available intervention adds 3\.6 years of life, a wealth or savings figure, or medical advice/, 'longevity protocol guidance should keep the aging-economics relay in the attributed lane');
      assert.match(protocolsSource, /stage-lights blue-light anecdote as attributed N=1 event chronology with a well-verified direction[^]*Not a measured result, a reader light-exposure protocol, or medical advice/, 'sleep protocol guidance should keep the blue-light anecdote in the attributed lane');
    });

    it('rotates audit-window and site-content counters for the October 27 pass', () => {
      assert.match(signalsSource, /50 Oct 19–27 posts reviewed last pass via read-only bird user-tweets audit/, 'audit window should cover this pass');
      assert.match(signalsSource, /4 sources matched last pass · Hu\/Garcia\/Campen et al\. Toxicological Sciences 2024/, 'sources-verified counter should cover this pass');
      assert.match(signalsSource, /50 Oct 17–27 posts reviewed earlier pass via read-only bird user-tweets audit/, 'prior-pass audit window should carry the demoted October 27 label');
      assert.match(signalsSource, /4 sources matched last pass · Widjaja et al\. Nature 2024/, 'prior-pass sources counter should carry the demoted label');
      assert.match(signalsSource, /\{ date: '2026-10-28', x_post: 4, third_party: 0, wiki_update: 0, site_update: 1/, 'curated activity should include the October 28 site row');
      assert.match(signalsSource, /\{ date: '2026-10-27', x_post: 11, third_party: 0, wiki_update: 0, site_update: 1/, 'curated activity should recount the October 27 feed');
      assert.match(signalsSource, /\{ date: '2026-10-26', x_post: 2/, 'curated activity should recount the October 26 feed');
      assert.match(signalsSource, /\{ date: '2026-10-25', x_post: 3, third_party: 0, wiki_update: 0, site_update: 1/, 'curated activity should recount the October 25 feed');

      const updatePage = readFileSync(new URL('../src/content/updates/2026-10-28-semen-microplastics-mri-bedroom-curation.md', import.meta.url), 'utf8');
      assert.match(updatePage, /50 posts spanning October 19–27/, 'update page should document the audit window');
      assert.match(updatePage, /nine items newer than the last covered boundary/, 'update page should document the gap tally');
      assert.match(updatePage, /Hu\/Garcia\/Campen et al\., Toxicological Sciences, August 2024/, 'update page should document the testis-study verification');
      assert.match(updatePage, /10\.6% rounded/, 'update page should document the PTFE arithmetic check');
      assert.match(updatePage, /This test is not widely available/, 'update page should document the zero-claim boundary');
      assert.match(updatePage, /32\.1% pooled critical-or-indeterminate incidental findings/, 'update page should document the MRI screening context');
      assert.match(updatePage, /stimulus control therapy/, 'update page should document the bedroom-directive verification');
      assert.match(updatePage, /Skipped as low-signal\/banter\/identity/, 'update page should document the skip decisions');
    });

    it('publishes the October 27 semen-microplastics, MRI, and bedroom posts as attributed claims with verified context', () => {
      for (const required of [
        'semen-microplastics-zero-claim',
        '2115135756490747981',
        'https://x.com/bryan_johnson/status/2115135756490747981',
        'https://x.com/bryan_johnson/status/2052466542445805988',
        'https://doi.org/10.1093/toxsci/kfae060',
        'https://doi.org/10.1016/j.ebiom.2024.105369',
        'Up to 100% of men have microplastics in their semen',
        'I got mine to zero. The first documented case.',
        'all of 113 tested men from China',
        '11% lower sperm concentration and 9% fewer total sperm',
        '52.13 vs 58.32 million/mL',
        '188.90 vs 207.67 million',
        'cross-sectional, association not causation',
        'This test is not widely available, sadly. I had a specialty lab create the test for me',
        'twice-yearly-mri-protocol-report',
        '2115200763668631982',
        'https://x.com/bryan_johnson/status/2115200763668631982',
        'my twice yearly mri results',
        'hippocampal occupancy - 99th percentile',
        'my body is indistinguishable from an elite athlete',
        'does not believe there is sufficient evidence to justify recommending total body screening',
        '32.1% prevalence of critical-or-indeterminate incidental findings',
        'bedroom-stimulus-control-directive',
        '2115078044440477981',
        'https://x.com/bryan_johnson/status/2115078044440477981',
        'Your bedroom should be cold, dark and boring',
        'https://doi.org/10.5664/jcsm.8988',
        'stimulus control therapy',
        'the AASM specifically suggests against sleep hygiene as a stand-alone therapy for chronic insomnia disorder',
        'not evidence that non-stick pans harm readers’ fertility, a validated zero-microplastics protocol, a reader testing recommendation, or medical advice',
        "confidence: 'medium'",
      ]) {
        assert.ok(signalsSource.includes(required), `October 27 signals should preserve: ${required}`);
      }

      assert.match(dashboardSectionsSource, /the microplastics story reaches semen[^]*not evidence that Teflon pans harm readers’ fertility, a validated zero-microplastics protocol, a reader imaging recommendation, an insomnia treatment, or medical advice/i, 'timeline should pair the October 27 cluster with its boundary');

      const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
      assert.match(bryanJohnsonSource, /On October 27, nine more items arrived[^]*Up to 100% of men have microplastics in their semen[^]*not evidence that Teflon pans harm readers’ fertility, a validated zero-microplastics protocol, a reader imaging recommendation, an insomnia treatment, or medical advice/i, 'bryan-johnson page should record the October 27 cluster with its boundary');

      assert.match(protocolsSource, /semen-microplastics relay as two real studies carried accurately around an unreplicable N=1 centerpiece[^]*Not evidence that non-stick pans harm readers’ fertility, a validated zero-microplastics protocol, or medical advice/, 'nutrition protocol guidance should keep the semen relay in the attributed lane');
      assert.match(protocolsSource, /twice-yearly MRI readout as an attributed measurement disclosure[^]*Not evidence that twice-yearly whole-body MRI improves outcomes, a validated age-equivalence score, or medical advice/, 'health protocol guidance should keep the MRI readout in the attributed lane');
      assert.match(protocolsSource, /bedroom directive as the feed’s most evidence-aligned sleep guidance[^]*Not a reader insomnia treatment, a clinical protocol, or medical advice/, 'sleep protocol guidance should keep the bedroom directive in the attributed lane');
      assert.match(protocolsSource, /label: 'Twice-yearly MRI readout'/, 'health protocol dossier should carry an MRI card');
      assert.match(protocolsSource, /label: 'Bedroom directive'/, 'sleep protocol dossier should carry a bedroom card');
    });


  it('rotates audit-window and site-content counters for the October 18 pass', () => {
      assert.match(signalsSource, /50 Oct 5–18 posts reviewed last pass via read-only bird user-tweets audit/, 'audit window should carry the demoted October 18 label');
      assert.match(signalsSource, /12 knowledge pages \+ 82 update pages/, 'site content count should include the new update page');
      assert.match(signalsSource, /4 sources matched last pass · Turco 2021 menstrual-flow organoid study/, 'sources-verified counter should carry the demoted October 18 label');
      assert.match(signalsSource, /\{ date: '2026-10-19', x_post: 7/, 'curated activity should recount the October 19 feed');
      assert.match(signalsSource, /\{ date: '2026-10-18', x_post: 3/, 'curated activity should recount the October 18 feed');

      const updatePage = readFileSync(new URL('../src/content/updates/2026-10-19-endo-organoid-method-curation.md', import.meta.url), 'utf8');
      assert.match(updatePage, /50 posts spanning October 5–18/, 'update page should document the audit window');
      assert.match(updatePage, /three posts newer than the last covered window, all on October 18/, 'update page should document the gap tally');
      assert.match(updatePage, /Turco et al\. \(Communications Biology, 2021/, 'update page should document the organoid verification');
      assert.match(updatePage, /Boretto et al\. \(Nature Cell Biology, 2019/, 'update page should document the endometriosis-organoid verification');
      assert.match(updatePage, /eutopic \(uterine\) endometrium/, 'update page should document the model-fidelity boundary');
      assert.match(updatePage, /9'8" with a 6" ball/, 'update page should document the dunk-rim disclosure');
      assert.match(updatePage, /eight prior dunk-post skips/, 'update page should document the skip-consistency note');
    });

    it('publishes the October 18 endometriosis organoid method disclosure as an attributed method claim with verified literature context', () => {
      for (const required of [
        'endo-organoid-method-disclosure',
        '2111861961394962672',
        '2111865059416949245',
        'https://x.com/bryan_johnson/status/2111861961394962672',
        'https://x.com/bryan_johnson/status/2111865059416949245',
        'https://www.nature.com/articles/s42003-021-02194-y',
        'https://www.nature.com/articles/s41556-019-0360-z',
        'Collected Kate’s period blood yesterday',
        '30 mL to build an organoid',
        'single cell molecular characterization',
        'recreate her biology in a lab dish',
        'Turco et al. (Communications Biology, 2021',
        '87% success rate',
        'Boretto et al. (Nature Cell Biology, 2019',
        'menstrual-flow organoids model the eutopic (uterine) endometrium',
        'whether a menstrual-flow organoid faithfully models Tolo’s lesions is',
        'scale-up from the 7 mL collection',
        'not evidence that a cure or therapy test exists, a collection protocol readers can follow, or medical advice',
        "confidence: 'medium'",
      ]) {
        assert.ok(signalsSource.includes(required), `endo-organoid signal should preserve: ${required}`);
      }

      assert.match(dashboardSectionsSource, /Collected Kate’s period blood[^]*not evidence that a cure or therapy test exists, a collection protocol readers can follow, or medical advice/i, 'timeline should pair the endo-organoid disclosure with its boundary');

      const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
      assert.match(bryanJohnsonSource, /On October 18[^]*organoid[^]*not evidence that a cure or therapy test exists, a collection protocol readers can follow, or medical advice/i, 'bryan-johnson page should record the endo-organoid disclosure with its boundary');

      assert.match(protocolsSource, /30 mL of menstrual blood to build an organoid[^]*Turco et al\. 2021[^]*Boretto et al\. 2019[^]*Not a collection protocol readers can follow or medical advice/, 'health protocol guidance should keep the endo-organoid method in the attributed lane');
      assert.match(protocolsSource, /label: 'Endo organoid method'/, 'health protocol dossier should carry an endo-organoid card');

      assert.match(signalsSource, /Watch whether Johnson publishes the actual intervention[^]*October 18 posts disclosed a first method[^]*Attributed program-intent tracking, not cure evidence or medical advice/, 'watch item should track the disclosed method without converting it to cure evidence');
    });

    it('rotates audit-window and site-content counters for the October 17 pass', () => {
      assert.match(signalsSource, /50 Oct 3–17 posts reviewed last pass via read-only bird user-tweets audit/, 'audit window should carry the demoted October 17 label');
      assert.match(signalsSource, /12 knowledge pages \+ 82 update pages/, 'site content count should include the new update page');
      assert.match(signalsSource, /3 sources matched last pass · You Can See Everything film record/, 'sources-verified counter should carry the demoted October 17 label');
    assert.match(signalsSource, /\{ date: '2026-10-18', x_post: 3/, 'curated activity should recount the October 18 feed');
    assert.match(signalsSource, /\{ date: '2026-10-17', x_post: 4/, 'curated activity should recount the October 17 feed');

    const updatePage = readFileSync(new URL('../src/content/updates/2026-10-18-sleep-deviation-meme-curation.md', import.meta.url), 'utf8');
    assert.match(updatePage, /50 posts spanning October 3–17/, 'update page should document the audit window');
    assert.match(updatePage, /four posts newer than the last covered window/, 'update page should document the gap tally');
    assert.match(updatePage, /You Can See Everything/, 'update page should document the film verification');
    assert.match(updatePage, /20,760 likes/, 'update page should document the engagement record');
    assert.match(updatePage, /off the record/, 'update page should document the off-record boundary');
  });

  it('publishes the October 17 sleep-deviation cluster as an attributed consistency-deviation and public-perception claim with verified film context', () => {
    for (const required of [
      'sleep-deviation-meme-cluster',
      '2111486128809517355',
      'https://x.com/bryan_johnson/status/2111486128809517355',
      'https://x.com/paularambles/status/2111347609696952365',
      'https://en.wikipedia.org/wiki/You_Can_See_Everything',
      'I got 4 hr 41 min of sleep',
      'the man who invented going to bed',
      '12,955 likes',
      '20,760 likes, 157 replies, 216 reposts',
      'previous tracked maximum for his own posts was 9,557',
      'AASM/SRS consensus floor of 7 or more hours per night (Watson et al., 2015)',
      'I can’t say what we talked about because it was off the record',
      'Billy Evans, Elizabeth Holmes’s partner',
      'opened in US theaters October 16, 2026',
      'Nathan Fielder and Lance Oppenheim',
      'one short night is not a health event',
      'his own framework treats sleep consistency, not any single night, as the signal',
      'not film criticism this site endorses',
      'not a protocol failure verdict, a sleep recommendation, or medical advice',
      "confidence: 'medium'",
    ]) {
      assert.ok(signalsSource.includes(required), `sleep-deviation signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /I got 4 hr 41 min of sleep[^]*not a protocol failure verdict, a sleep recommendation, or medical advice/i, 'timeline should pair the sleep-deviation cluster with its boundary');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /On October 17[^]*You Can See Everything[^]*not a protocol failure verdict, a sleep recommendation, or medical advice/i, 'bryan-johnson page should record the sleep-deviation cluster with its boundary');

    assert.match(protocolsSource, /4 hr 41 min of sleep[^]*AASM\/SRS 7-hour consensus floor[^]*not evidence about the protocol, a sleep recommendation, or medical advice/, 'sleep protocol guidance should keep the deviation in the attributed lane');
    assert.match(protocolsSource, /label: 'Sleep deviation'/, 'sleep protocol dossier should carry a sleep-deviation card');
  });

  it('rotates audit-window and site-content counters for the October 16 pass', () => {
    assert.match(signalsSource, /50 Oct 2–16 posts reviewed last pass via read-only bird user-tweets audit/, 'audit window should carry the demoted October 16 label');
    assert.match(signalsSource, /12 knowledge pages \+ 82 update pages/, 'site content count should include the new update page');
    assert.match(signalsSource, /3 sources matched last pass · CMAJ 2016 RHR–mortality meta-analysis/, 'sources-verified counter should carry the demoted October 16 label');
    assert.match(signalsSource, /\{ date: '2026-10-16', x_post: 4/, 'curated activity should recount the October 16 feed');
    assert.match(signalsSource, /\{ date: '2026-10-15', x_post: 5/, 'curated activity should recount the October 15 feed');

    const updatePage = readFileSync(new URL('../src/content/updates/2026-10-17-rhr-status-engineering-curation.md', import.meta.url), 'utf8');
    assert.match(updatePage, /50 posts spanning October 2–16/, 'update page should document the audit window');
    assert.match(updatePage, /nine posts newer than the last covered window/, 'update page should document the gap tally');
    assert.match(updatePage, /CMAJ 2016 meta-analysis/, 'update page should document the RHR-mortality verification');
    assert.match(updatePage, /Skipped as banter, restatement, or chronology/, 'update page should document the skip decisions');
  });

  it('publishes the October 16 RHR status-engineering disclosure as an attributed ideology-and-marketing claim with verified outcome-predictor context', () => {
    for (const required of [
      'rhr-status-engineering-disclosure',
      '2111149094576202049',
      'https://x.com/bryan_johnson/status/2111149094576202049',
      'https://doi.org/10.1503/cmaj.150535',
      'Resting heart is the new thirst trap',
      '207 times',
      '366,220 likes',
      '78.3 million views',
      'I had to break RHR out of esoteric health and into status and social signaling',
      'signal genetic fitness',
      '846 likes, 82 replies',
      '1,246,203 adults, 78,349 deaths',
      'all-cause mortality RR 1.09 (95% CI 1.07–1.12)',
      'RHR >80 bpm at RR 1.45 for all-cause mortality',
      'trim-and-fill corrected all-cause RR 1.04',
      'not recommended in US/European cardiovascular risk-assessment guidelines',
      'self-reported X analytics not independently auditable',
      'not a validated adoption trend, a sleep protocol, a health directive, or medical advice',
      "confidence: 'medium'",
    ]) {
      assert.ok(signalsSource.includes(required), `RHR signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /Resting heart is the new thirst trap[^]*not a validated adoption trend, a sleep protocol, a health directive, or medical advice/i, 'timeline should pair the RHR disclosure with its boundary');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /On October 16[^]*cmaj[.]150535[^]*not a validated adoption trend, a sleep protocol, a health directive, or medical advice/i, 'bryan-johnson page should record the RHR disclosure with its boundary');

    const dontDieSource = readFileSync(new URL('../src/content/knowledge/dont-die.md', import.meta.url), 'utf8');
    assert.match(dontDieSource, /On October 16[^]*cmaj[.]150535[^]*not a validated adoption trend, a sleep protocol, a health directive, or medical advice/i, 'dont-die page should record the RHR disclosure with its boundary');

    assert.match(protocolsSource, /Resting heart is the new thirst trap[^]*RR 1[.]09[^]*Not a sleep protocol, a health directive, or medical advice/, 'longevity protocol guidance should keep the RHR disclosure in the attributed lane');
    assert.match(protocolsSource, /label: 'RHR status engineering'/, 'longevity protocol dossier should carry an RHR-disclosure card');
  });

  it('rotates audit-window and site-content counters for the October 14 pass', () => {
    assert.match(signalsSource, /50 Sep 25–Oct 15 posts reviewed last pass via read-only bird user-tweets audit/, 'audit window should carry the demoted October 14 label');
    assert.match(signalsSource, /12 knowledge pages \+ 82 update pages/, 'site content count should include the new update page');
    assert.match(signalsSource, /3 sources matched last pass · NEJM deCODE Iceland actionable-genotype study/, 'sources-verified counter should carry the demoted October 14 label');
    assert.match(signalsSource, /\{ date: '2026-10-15', x_post: 5/, 'curated activity should recount the October 15 feed');
    assert.match(signalsSource, /\{ date: '2026-10-14', x_post: 3/, 'curated activity should recount the October 14 feed');

    const updatePage = readFileSync(new URL('../src/content/updates/2026-10-15-genome-utility-curation.md', import.meta.url), 'utf8');
    assert.match(updatePage, /50 posts spanning September 25–October 15/, 'update page should document the audit window');
    assert.match(updatePage, /last covered post: October 14, 00:51 UTC, the dunk-training protocol video/, 'update page should document the starting point');
    assert.match(updatePage, /three posts newer than the last covered post \(October 14–15\), one substantive/, 'update page should document the gap tally');
    assert.match(updatePage, /NEJM/, 'update page should document the deCODE prevalence verification');
    assert.match(updatePage, /WA HCA/, 'update page should document the WGS evidence-report verification');
    assert.match(updatePage, /Skipped as engagement banter/, 'update page should document the skip decisions');
  });

  it('publishes the October 14 genome-utility admission as an attributed negative result with verified prevalence context', () => {
    for (const required of [
      'genome-actionability-admission',
      '2110438813122359731',
      'https://x.com/bryan_johnson/status/2110438813122359731',
      'https://doi.org/10.1056/NEJMoa2300792',
      'I can’t find a way to use my genome',
      'Fully sequenced in 2012',
      '$7,902 for matched 30x long read + 100x short read',
      'What am I missing?',
      '1,937 likes, 521 replies',
      '57,933 whole-genome-sequenced Icelanders',
      '4.0% (1 in 25) carry at least one actionable genotype',
      'ACMG Secondary Findings v3.0',
      '3.75% of 7,472 genomes',
      '3.5% under SF v3.1',
      '0–12.5% of tested persons',
      'Invitae panel across 71 inherited-cancer genes found no pathogenic variants',
      'carrier screening before pregnancy, pharmacogenomics, and diagnostic contexts for suspected genetic disease operate under different yield math',
      '521-reply suggestion thread was not independently assessed',
      'not a testing recommendation for or against sequencing, or medical advice',
      "confidence: 'medium'",
    ]) {
      assert.ok(signalsSource.includes(required), `genome-admission signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /I can’t find a way to use my genome[^]*not a testing recommendation for or against sequencing, or medical advice/i, 'timeline should pair the genome admission with its boundary');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /On October 14[^]*NEJM, 10[.]1056\/NEJMoa2300792[^]*not a testing recommendation for or against sequencing, or medical advice/i, 'bryan-johnson page should record the genome admission with its boundary');

    assert.match(protocolsSource, /I can’t find a way to use my genome[^]*4[.]0% carry an actionable ACMG SF v3[.]0 genotype[^]*Not a testing recommendation for or against sequencing, or medical advice/, 'longevity protocol guidance should keep the genome admission in the attributed lane');
    assert.match(protocolsSource, /label: 'Genome null result'/, 'longevity protocol dossier should carry a genome-admission card');
  });

  it('publishes the October 13 Blue Zones claim as an attributed amplification with verified records and scientific pushback', () => {
    for (const required of [
      'blue-zones-illusion-claim',
      '2110155459781112084',
      'https://x.com/bryan_johnson/status/2110155459781112084',
      'https://x.com/Michael_Easter/status/2084258413157175533',
      'The Blue Zones are an illusion',
      'bad record keeping, pension fraud, and lots of money',
      'Saul Justin Newman',
      '2024 Ig Nobel Prize in Demography',
      'Japan’s 2010 government review found 82%',
      '230,000',
      'Italy’s 1997 pension audit',
      'Costa Rica’s 2008 review found 42%',
      'least vegetables and sweet potatoes in Japan',
      'non-peer-reviewed preprint',
      'Pes, Poulain et al.',
      'Bischoff-Ferrari',
      'Daniela Jopp',
      'not a settled finding that no population exhibits exceptional longevity, a dietary directive, or medical advice',
      "confidence: 'medium'",
    ]) {
      assert.ok(signalsSource.includes(required), `blue-zones signal should preserve: ${required}`);
    }

    assert.match(dashboardSectionsSource, /The Blue Zones are an illusion[^]*not a settled finding that no population exhibits exceptional longevity, a dietary directive, or medical advice/i, 'timeline should pair the Blue Zones claim with its boundary');

    const bryanJohnsonSource = readFileSync(new URL('../src/content/knowledge/bryan-johnson.md', import.meta.url), 'utf8');
    assert.match(bryanJohnsonSource, /On October 13[^]*Ig Nobel[^]*not a settled finding that no population exhibits exceptional longevity, a dietary directive, or medical advice/i, 'bryan-johnson page should record the Blue Zones claim with its boundary');

    assert.match(protocolsSource, /Blue Zones are an illusion[^]*82% of listed centenarians deceased[^]*Not a settled finding that no population exhibits exceptional longevity/, 'longevity protocol guidance should keep the Blue Zones claim in the attributed lane');
    assert.match(protocolsSource, /label: 'Blue Zones claim'/, 'longevity protocol dossier should carry a Blue Zones card');
  });

  it('replaces right-sidebar placeholders with real watch queue, source counts, and curated activity', () => {
    for (const phrase of ['watchQueue', 'sourceCounts', 'curatedActivity', 'Protocol tabs backed']) {
      assert.match(indexSource, new RegExp(phrase), `overview should use real sidebar data: ${phrase}`);
    }
    for (const phrase of ['Enhanced Games follow-up', 'Kate Tolo baseline', 'Microplastics testing', '82 unique tweet URLs', '11 tweets with engagement']) {
      assert.match(signalsSource, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `signals/sidebar data should include ${phrase}`);
    }
    for (const phrase of ['1 Aug 16 post captured', '9 Aug 18–20 posts captured', '12 knowledge pages + 82 update pages']) {
      assert.match(signalsSource, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `source counts should include ${phrase}`);
    }
    assert.doesNotMatch(indexSource, /index \* 17|updateCards\[0\]|next curated publish pass/, 'right sidebar should not use deterministic placeholder formulas or newest-card watch copy');
  });

  it('adds source-aware protocol and concept routes for all reference categories', () => {
    for (const file of [conceptsPagePath, nutritionPagePath, sleepPagePath]) {
      assert.ok(existsSync(file), `missing route: ${file.pathname}`);
    }
    for (const category of ['health', 'longevity', 'nutrition', 'sleep']) {
      assert.match(protocolsSource, new RegExp(`category:\\s*['"]${category}['"]`), `protocol data missing ${category}`);
    }
    assert.match(conceptsPageSource, /conceptEntries/, 'concepts route should render curated concept entries');
    assert.match(conceptsPageSource, /Female-specific Blueprint/, 'concepts route should include source-aware concepts without dedicated wiki pages');
    assert.match(nutritionPageSource, /source-aware|not medical advice/i, 'nutrition page should preserve source-aware medical caution');
    assert.match(sleepPageSource, /source-aware|not medical advice/i, 'sleep page should preserve source-aware medical caution');
  });

  it('renders Habits, Longterm, and Don’ts sections on every protocol surface', () => {
    assert.ok(existsSync(protocolSectionComponentPath), 'shared protocol section component should exist');
    for (const label of protocolSectionLabels) {
      assert.ok(protocolSectionComponentSource.includes(`label: '${label}'`), `component should know ${label}`);
      assert.ok(indexSource.includes(label), `overview protocol cards should mention ${label}`);
    }

    for (const [category, pageSource] of [
      ['health', readFileSync(new URL('../src/pages/health/index.astro', import.meta.url), 'utf8')],
      ['longevity', readFileSync(new URL('../src/pages/longevity/index.astro', import.meta.url), 'utf8')],
      ['nutrition', nutritionPageSource],
      ['sleep', sleepPageSource],
    ]) {
      assert.match(protocolsSource, new RegExp(`category:\\s*['"]${category}['"][\\s\\S]*sections:\\s*\\{[\\s\\S]*habits:[\\s\\S]*longterm:[\\s\\S]*donts:`), `${category} protocol should define all required buckets`);
      assert.match(pageSource, /<Protocol(Dossier|Sections)/, `${category} route should render shared protocol bucket/dossier component`);
    }

    assert.match(protocolsSource, /protocolSectionsBySlug/, 'knowledge pages should be able to reuse protocol buckets by slug');
    assert.match(knowledgeShellSource, /protocolSectionsBySlug/, 'knowledge detail pages should render protocol sections when content is protocol-like');
  });
});
