export type OpinionItem = {
  claim: string;
  position: string;
  counterpoint: string;
  confidence: 'high' | 'medium' | 'low';
  relatedHref: string;
  relatedTitle: string;
  sources: string[];
};

export type TimelineEvent = {
  date: string;
  label: string;
  summary: string;
  relatedHref: string;
  relatedTitle: string;
  source: string;
  confidence: 'high' | 'medium' | 'low';
};

export const opinionItems: OpinionItem[] = [
  {
    claim: 'Biomarkers and organs should outrank cravings when choosing health behavior.',
    position: 'Johnson frames Blueprint as a delegated decision system: measure the body, let the data produce the “grocery shopping list,” and reduce the authority of momentary preference.',
    counterpoint: 'The public evidence is strongest for ordinary foundations such as sleep, exercise, nutrition, and oral care; dense measurement can still overfit proxies or become expensive N=1 optimization.',
    confidence: 'medium',
    relatedHref: '/knowledge/blueprint-protocol/',
    relatedTitle: 'Blueprint Protocol',
    sources: [
      'raw/articles/project-blueprint-2021-10-13.md',
      'raw/articles/critical-context-bryan-johnson-blueprint-2026-05-22.md',
    ],
  },
  {
    claim: '“Don’t Die” is more than a slogan; it is a moralized survival philosophy.',
    position: 'The wiki synthesis presents Don’t Die as a community and civilizational frame that treats self-destructive choices as harms against future selves and extends the health project into AI-era survival language.',
    counterpoint: 'That framing can motivate consistency, but it can also make normal tradeoffs sound like moral failures and blur health advice, identity, and ideology.',
    confidence: 'medium',
    relatedHref: '/knowledge/dont-die/',
    relatedTitle: "Don't Die",
    sources: [
      'raw/articles/bryan-johnson/dont-die-bryan-johnson-2026-05-22.md',
      'raw/articles/bryan-johnson/x-twitter-bryan-johnson-2026-05-22.md',
    ],
  },
  {
    claim: '“Immortality by 2039” is an aspirational target, not an established forecast.',
    position: 'Johnson’s stated goal is to keep biological age from advancing for a chronological year, with AI and organ-clone testing accelerating discovery.',
    counterpoint: 'The site should keep this in the opinion/claim lane: the target is explicitly uncertain, depends on unsettled science, and has low confidence in the current knowledge model.',
    confidence: 'low',
    relatedHref: '/knowledge/immortality-by-2039/',
    relatedTitle: 'Immortality by 2039',
    sources: [
      'raw/articles/blueprint-immortal-by-2039-2026-01-30.md',
      'raw/articles/bryan-johnson-x-targeted-searches-2026-05-22.md',
    ],
  },
  {
    claim: 'Blueprint can be read as a consumer health platform as much as a self-experiment.',
    position: 'By 2026 the project had become products, protocol personalization, biomarker testing, and an AI health companion, not just Johnson’s personal protocol.',
    counterpoint: 'Commercialization increases access and operational polish, but it also raises the bar for source clarity around what is evidence-backed, what is branded, and what remains contested.',
    confidence: 'medium',
    relatedHref: '/knowledge/project-blueprint/',
    relatedTitle: 'Project Blueprint',
    sources: [
      'raw/articles/bryan-johnson/blueprint-home-2026-05-22.md',
      'raw/articles/bryan-johnson/mdlinx-blueprint-critique-2025-02-15.md',
    ],
  },
];

export const timelineEvents: TimelineEvent[] = [
  {
    date: '2007',
    label: 'Braintree founded',
    summary: 'Johnson founded Braintree after identifying an opportunity in developer-friendly payment processing.',
    relatedHref: '/knowledge/braintree/',
    relatedTitle: 'Braintree',
    source: 'raw/articles/chicago-booth-bryan-johnson-kernel-os-fund-2019.md',
    confidence: 'high',
  },
  {
    date: '2013',
    label: 'Braintree acquired by eBay/PayPal',
    summary: 'The $800M acquisition funded Johnson’s later deep-tech, brain-interface, and longevity work.',
    relatedHref: '/knowledge/braintree/',
    relatedTitle: 'Braintree',
    source: 'raw/articles/cnbc-kernel-bryan-johnson-2017.md',
    confidence: 'high',
  },
  {
    date: '2014',
    label: 'OS Fund created',
    summary: 'Johnson committed capital to OS Fund to back scientist-entrepreneurs working on engineered biology and other deep-tech systems.',
    relatedHref: '/knowledge/os-fund/',
    relatedTitle: 'OS Fund',
    source: 'raw/articles/bryan-johnson-about-2026-05-22.md',
    confidence: 'medium',
  },
  {
    date: '2016',
    label: 'Kernel founded',
    summary: 'Kernel extended Johnson’s measurement thesis into neurotechnology: the brain as the next system to measure and improve.',
    relatedHref: '/knowledge/kernel/',
    relatedTitle: 'Kernel',
    source: 'raw/articles/bryan-johnson-about-2026-05-22.md',
    confidence: 'high',
  },
  {
    date: '2021',
    label: 'Project Blueprint begins',
    summary: 'Blueprint launched as an N=1 self-experiment measuring organs and biomarkers, applying interventions, then re-measuring.',
    relatedHref: '/knowledge/project-blueprint/',
    relatedTitle: 'Project Blueprint',
    source: 'raw/articles/bryan-johnson/bryan-johnson-project-blueprint-2021-10-13.md',
    confidence: 'medium',
  },
  {
    date: '2024-03-12',
    label: 'Blueprint automation framing appears in public posts',
    summary: 'Johnson’s public messaging tied Blueprint to automation and delegated decision authority rather than preference-led behavior.',
    relatedHref: '/knowledge/blueprint-protocol/',
    relatedTitle: 'Blueprint Protocol',
    source: 'raw/articles/bryan-johnson-x-blueprint-automation-2024-03-12.md',
    confidence: 'medium',
  },
  {
    date: '2025-08-07',
    label: 'Metformin pause illustrates protocol reversals',
    summary: 'A public metformin pause is used in the wiki as evidence that the protocol changes when measurements or risk judgments change.',
    relatedHref: '/knowledge/blueprint-protocol/',
    relatedTitle: 'Blueprint Protocol',
    source: 'raw/articles/bryan-johnson-x-paused-metformin-2025-08-07.md',
    confidence: 'medium',
  },
  {
    date: '2026-01-30',
    label: '“Immortality by 2039” target published',
    summary: 'Johnson stated an aspirational target of immortality by 2039 while acknowledging possible failure.',
    relatedHref: '/knowledge/immortality-by-2039/',
    relatedTitle: 'Immortality by 2039',
    source: 'raw/articles/blueprint-immortal-by-2039-2026-01-30.md',
    confidence: 'low',
  },
  {
    date: '2026-04-22',
    label: '2026 morning routine snapshot',
    summary: 'The public routine emphasizes bedtime, light, oral care, exercise, sauna, red/NIR light, skincare, and nutrient-dense breakfast.',
    relatedHref: '/knowledge/blueprint-protocol/',
    relatedTitle: 'Blueprint Protocol',
    source: 'raw/articles/bryan-johnson-morning-routine-2026-04-22.md',
    confidence: 'medium',
  },
  {
    date: '2026-05-22',
    label: 'Current wiki synthesis ingested',
    summary: 'The public KB was updated with synthesized pages for Bryan Johnson, Blueprint, Don’t Die, source mapping, and related concepts.',
    relatedHref: '/knowledge/bryan-johnson-source-map/',
    relatedTitle: 'Bryan Johnson Source Map',
    source: 'queries/bryan-johnson-source-map.md',
    confidence: 'medium',
  },
];
