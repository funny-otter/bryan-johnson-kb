export const protocolCategories = [
  {
    category: 'health',
    title: 'Health protocol',
    lede:
      'A source-aware view of Blueprint health routines: measurement, sleep consistency, oral care, exercise, nutrition basics, and caution around experimental or N=1 claims.',
    confidence: 'mixed',
    sourcePaths: [
      'concepts/blueprint-protocol.md',
      'entities/project-blueprint.md',
      'concepts/algorithmic-health.md',
      'raw/articles/bryan-johnson/bryan-johnson-protocol-2026-05-22.md',
      'raw/articles/bryan-johnson/x-twitter-bryan-johnson-2026-05-22.md',
      'raw/articles/bryan-johnson/x-twitter-daily-2026-06-12.md',
      'raw/articles/bryan-johnson/x-twitter-daily-2026-06-13.md',
    ],
    sections: {
      habits: [
        'Run the measurement loop: bloodwork, wearables, oral/skin/organ metrics, then retest instead of relying on vibes.',
        'Keep the stable inputs visible first: consistent sleep, training, nutrient-dense meals, oral care, light exposure, and recovery.',
      ],
      longterm: [
        'Treat Blueprint as a repeatable feedback system whose rules can evolve as biomarkers, symptoms, or evidence change.',
        'Track the June 2026 prescription-therapeutics expansion separately from foundational habits; it is a commercial/protocol claim that requires clinician oversight.',
        'Preserve medical-caution framing: this page summarizes Johnson/Blueprint practice, not personal treatment advice.',
      ],
      donts: [
        'Do not present N=1 biomarker movement as proof of clinical outcomes.',
        'Do not mix experimental drugs, hormones, or supplements into the same confidence tier as sleep, exercise, and food quality.',
      ],
    },
    cards: [
      {
        label: 'Measurement loop',
        title: 'Use biomarkers as feedback, not as guaranteed outcomes',
        body: 'Blueprint material emphasizes bloodwork, wearable data, and retesting. The public site should frame those as Johnson/Blueprint claims and source trails, not personal treatment recommendations.',
      },
      {
        label: 'Foundational inputs',
        title: 'Sleep, training, food quality, oral care',
        body: 'The higher-confidence health layer is routine consistency: bedtime discipline, exercise, nutrient-dense meals, and oral-health attention. Exact targets need source verification before display.',
      },
      {
        label: 'Caution',
        title: 'Experimental interventions stay separated',
        body: 'Hormonal, drug, or supplement experiments belong behind caution labels unless backed by independent clinical evidence for the specific claim.',
      },
      {
        label: 'Rx expansion',
        title: 'Prescription access is now part of the Blueprint story',
        body: 'The June 2026 Longevity Rx announcement is product-positioning and protocol evidence, not a public recommendation to use Metformin, Tadalafil, hormones, or other drugs.',
      },
    ],
  },
  {
    category: 'longevity',
    title: 'Longevity protocol',
    lede:
      'Longevity pages distinguish between measured healthspan practices, biomarker claims, public critiques, and low-confidence aspirational claims such as immortality by 2039.',
    confidence: 'mixed',
    sourcePaths: [
      'concepts/immortality-by-2039.md',
      'concepts/biomarker-driven-longevity-protocols.md',
      'concepts/blueprint-protocol.md',
      'raw/articles/blueprint-immortal-by-2039-2026-01-30.md',
      'raw/articles/bryan-johnson/years-biomarkers-limits-2026-04-20.md',
      'raw/articles/bryan-johnson/mdlinx-blueprint-critique-2025-02-15.md',
      'raw/articles/bryan-johnson/x-twitter-daily-2026-06-13.md',
    ],
    sections: {
      habits: [
        'Prioritize measured healthspan basics: exercise, sleep regularity, nutrition, risk-factor monitoring, and clinician-guided prevention.',
        'Read biological-age and speed-of-aging numbers as tracked claims with source trails and critique links nearby.',
      ],
      longterm: [
        'Separate durable healthspan practices from frontier enhancement, drug-stack, gene-therapy, and immortality narratives.',
        'Classify daily Tadalafil/Cialis and similar drug claims as hypothesis-generating prescription-intervention claims unless independent clinical evidence supports the exact longevity use case.',
        'Keep critiques visible so biomarker improvements do not become unsupported longevity promises.',
      ],
      donts: [
        'Do not render “immortality by 2039” as a realistic forecast or medical endpoint.',
        'Do not collapse Johnson’s ideology, Blueprint marketing, and independent evidence into one confidence level.',
      ],
    },
    cards: [
      {
        label: 'Biomarker claims',
        title: 'Biological age and speed-of-aging claims need claim framing',
        body: 'Show Johnson/Blueprint measurements as reported claims, then link critiques that question whether biomarker movement predicts clinical outcomes.',
      },
      {
        label: 'Evidence tiers',
        title: 'Separate basics from frontier experiments',
        body: 'Exercise, sleep, nutrition, and risk-factor management have a different evidence profile than gene therapies, aggressive drug stacks, or enhancement competition claims.',
      },
      {
        label: 'Prescription claims',
        title: 'Tadalafil/Cialis claims require observational-data caveats',
        body: 'Johnson frames daily 5 mg Tadalafil as blood-flow/longevity support, but his own caveat says observational associations are not causation and the post is not medical advice.',
      },
      {
        label: 'Aspirational ideology',
        title: 'Immortality by 2039 remains low-confidence',
        body: 'The concept is useful for understanding Johnson’s worldview, but the dashboard should not present it as a realistic medical forecast.',
      },
    ],
  },
  {
    category: 'nutrition',
    title: 'Nutrition protocol',
    lede:
      'Nutrition coverage focuses on source-backed themes: nutrient-dense plant-led meals, earlier eating, Blueprint products, microplastics claims, and metabolic-drug commentary with medical caution.',
    confidence: 'medium',
    sourcePaths: [
      'entities/project-blueprint.md',
      'concepts/blueprint-protocol.md',
      'raw/articles/bryan-johnson/bryan-johnson-protocol-2026-05-22.md',
      'raw/articles/bryan-johnson/x-twitter-bryan-johnson-2026-05-22.md',
      'raw/articles/bryan-johnson/blueprint-home-2026-05-22.md',
      'raw/articles/bryan-johnson/x-twitter-daily-2026-06-13.md',
    ],
    sections: {
      habits: [
        'Emphasize food quality and repeatability: plant-led meals, legumes/vegetables/healthy fats, earlier eating, and consistent prep.',
        'Pair product or testing claims with source paths so readers can distinguish Blueprint marketing from independent evidence.',
      ],
      longterm: [
        'Keep nutrition as one input in the measurement loop rather than a standalone promise of rejuvenation.',
        'Update exact calories, macros, and meal windows only when a current source supports the number.',
      ],
      donts: [
        'Do not publish prototype calorie, macro, supplement-dose, or eating-window numbers as universal targets.',
        'Do not treat metabolic-drug analogies or microplastics product claims as clinician guidance.',
      ],
    },
    cards: [
      {
        label: 'Food pattern',
        title: 'Nutrient-dense, plant-led Blueprint meals',
        body: 'Recent source-backed examples include vegetables, legumes, mushrooms, herbs, seeds, and olive oil. Keep this as a pattern summary; do not turn one breakfast post into universal meal advice.',
      },
      {
        label: 'Microplastics',
        title: 'Product/testing claims require causality caution',
        body: 'Microplastics material is useful as a signal, but the N=1 reduction claim should be framed as Johnson’s report and not as proven intervention efficacy.',
      },
      {
        label: 'Metabolic drugs',
        title: 'Retatrutide commentary is a claim/explainer',
        body: 'Drug analogies from tweets belong in the claims bucket and should explicitly remind readers to use clinician guidance for medications.',
      },
    ],
  },
  {
    category: 'sleep',
    title: 'Sleep protocol',
    lede:
      'Sleep coverage uses tweet-backed and protocol-backed material: bedtime consistency, sleep front-loading, wearable/biological-age framing, and source-aware caveats around exact metrics.',
    confidence: 'medium',
    sourcePaths: [
      'concepts/blueprint-protocol.md',
      'raw/articles/bryan-johnson/x-twitter-daily-2026-05-25.md#Sun May 24 22:07:24 +0000 2026--2058671232002990136',
      'raw/articles/bryan-johnson/x-twitter-bryan-johnson-2026-05-22.md#Tue May 19 13:51:22 +0000 2026',
      'raw/articles/bryan-johnson/x-twitter-bryan-johnson-2026-05-22.md#Thu May 21 13:59:33 +0000 2026',
      'raw/articles/bryan-johnson/bryan-johnson-protocol-2026-05-22.md',
    ],
    sections: {
      habits: [
        'Keep bedtime consistency as the central behavior signal, with Johnson’s own “go to bed on time” framing.',
        'Use front-loading sleep before planned late nights as a source-backed example, not as a universal rule.',
      ],
      longterm: [
        'Frame sleep as a durable foundation feeding the broader biomarker and recovery system.',
        'Add exact wearable targets only after source verification and keep them in claims/measurement context.',
      ],
      donts: [
        'Do not publish unsourced sleep score, REM, HRV, or wake-event targets.',
        'Do not imply one nap or one night can fully “repay” circadian disruption.',
      ],
    },
    cards: [
      {
        label: 'Consistency',
        title: '“Go to bed on time” is a recurring signal',
        body: 'Johnson repeatedly frames sleep timing as a key protocol behavior. Keep it as his source-backed habit signal rather than a universal prescription.',
      },
      {
        label: 'Front-loading',
        title: 'Earlier sleep before a planned late night',
        body: 'The May 24 tweet supplies a current example of sleep front-loading before violating an 8pm bedtime rule.',
      },
      {
        label: 'Metric caution',
        title: 'Do not publish exact REM/HRV targets without source verification',
        body: 'Prototype numbers like sleep score, REM percentage, HRV, or wake events need source-backed confirmation before they become public metrics.',
      },
    ],
  },
];

export const protocolSectionsBySlug = {
  'blueprint-protocol': protocolCategories.find((item) => item.category === 'health')?.sections,
  'project-blueprint': protocolCategories.find((item) => item.category === 'health')?.sections,
  'algorithmic-health': protocolCategories.find((item) => item.category === 'health')?.sections,
  'biomarker-driven-longevity-protocols': protocolCategories.find((item) => item.category === 'longevity')?.sections,
  'immortality-by-2039': protocolCategories.find((item) => item.category === 'longevity')?.sections,
  blueprint: protocolCategories.find((item) => item.category === 'nutrition')?.sections,
};

export const conceptEntries = [
  { title: 'Blueprint Protocol', confidence: 'medium', source: 'concepts/blueprint-protocol.md', summary: 'The measurement-led routine and intervention stack Johnson presents as Blueprint.' },
  { title: 'Biomarker-driven longevity protocols', confidence: 'medium', source: 'concepts/biomarker-driven-longevity-protocols.md', summary: 'The feedback-loop idea that biomarkers guide protocol changes, with caveats about outcomes.' },
  { title: 'Algorithmic Health', confidence: 'medium', source: 'concepts/algorithmic-health.md', summary: 'Delegating health decisions to measurement, rules, and repeatable systems.' },
  { title: "Don't Die", confidence: 'medium', source: 'concepts/dont-die.md', summary: 'Johnson’s anti-death ideology and movement framing.' },
  { title: 'Immortality by 2039', confidence: 'low', source: 'concepts/immortality-by-2039.md', summary: 'An aspirational longevity claim that should stay clearly low-confidence.' },
  { title: 'Project Blueprint', confidence: 'medium', source: 'entities/project-blueprint.md', summary: 'The company/protocol ecosystem around Johnson’s routine, products, and measurement claims.' },
  { title: 'Blueprint', confidence: 'medium', source: 'entities/blueprint.md', summary: 'The public brand/entity layer for products, protocol content, and community positioning.' },
  { title: 'Female-specific Blueprint / Kate Tolo protocol', confidence: 'medium', source: 'queries/bryan-johnson-recent-news-changelog.md + raw X/Kate articles', summary: 'A cycle-aware baseline project; source-aware because no dedicated synthesized wiki page exists yet.' },
  { title: 'Enhanced Games / measured human enhancement', confidence: 'medium', source: 'raw/articles/bryan-johnson/x-twitter-daily-2026-05-25.md', summary: 'Johnson’s enhancement-competition framing, not independent safety validation.' },
  { title: 'Protocol reversibility / intervention reversal', confidence: 'medium', source: 'raw/articles/bryan-johnson-x-paused-metformin-2025-08-07.md', summary: 'The principle that a protocol can reverse or pause interventions when measurements or risk assessments change.' },
  { title: 'Biomarkers vs clinical outcomes', confidence: 'medium', source: 'raw/articles/bryan-johnson/years-biomarkers-limits-2026-04-20.md', summary: 'The critique that biomarker improvements do not automatically prove better long-term outcomes.' },
  { title: "Don't Die as AI alignment / anti-entropy", confidence: 'low', source: 'raw/articles/bryan-johnson-x-targeted-searches-2026-05-22.md', summary: 'The broader ideology tying health, survival, AI-era alignment, and anti-entropic framing together.' },
];
