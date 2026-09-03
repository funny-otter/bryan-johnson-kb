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

  it('replaces right-sidebar placeholders with real watch queue, source counts, and curated activity', () => {
    for (const phrase of ['watchQueue', 'sourceCounts', 'curatedActivity', 'Protocol tabs backed']) {
      assert.match(indexSource, new RegExp(phrase), `overview should use real sidebar data: ${phrase}`);
    }
    for (const phrase of ['Enhanced Games follow-up', 'Kate Tolo baseline', 'Microplastics testing', '82 unique tweet URLs', '11 tweets with engagement']) {
      assert.match(signalsSource, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `signals/sidebar data should include ${phrase}`);
    }
    for (const phrase of ['1 Aug 16 post captured', '9 Aug 18–20 posts captured', '12 knowledge pages + 55 update pages']) {
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
