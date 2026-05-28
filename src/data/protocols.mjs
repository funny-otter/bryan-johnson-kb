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
    ],
    sections: {
      habits: [
        'Measure first, then adjust: bloodwork every 3–6 months plus wearable, oral, skin, organ, glucose, body-composition, and annual screening signals where appropriate.',
        'Make sleep the root health behavior: lower resting heart rate before bed, protect a consistent bedtime, and treat sleep as the foundation for exercise, nutrition, and self-control.',
        'Train the body every day in some form: strength, cardio, flexibility, balance, post-meal movement, and desk-break movement instead of occasional heroic workouts.',
        'Use food systems, not mood: make every calorie “fight for its life,” rely on repeatable meals, and avoid letting hunger/stress make eating decisions.',
        'Maintain the daily hygiene layer: oral care morning/night, skin protection, clean water, morning light, and relationship/community inputs.',
      ],
      longterm: [
        'Feedback loop: keep Blueprint as a repeatable measure → intervene → retest system whose rules change when biomarkers, symptoms, or evidence change.',
        'Cardiometabolic resilience: lower bedtime resting heart rate and stabilize sleep, glucose, blood pressure, and body composition over repeated measurements.',
        'Organ-age posture: track skin, oral, vascular, metabolic, muscle, bone, sleep, and fertility/sexual-function claims as measured targets, not vibes.',
        'Durable function: preserve muscle, bone density, mobility, balance, and injury resistance so the protocol compounds instead of causing setbacks.',
        'Medical-caution integrity: keep the public page source-aware and separate personal routine documentation from personal treatment advice.',
      ],
      donts: [
        'Do not present Johnson’s N=1 biomarker movement as proof of clinical outcomes for readers.',
        'Do not mix experimental drugs, hormones, procedures, or high-dose supplements into the same confidence tier as sleep, exercise, and food quality.',
        'Do not ignore bedtime RHR drivers: alcohol, anxiety/rumination, late caffeine, intense evening exercise, large late meals, nicotine, dehydration, heat, or stimulant medications.',
        'Do not let “Evening Bryan” style self-persuasion make food, screen, alcohol, or bedtime decisions; firm rules beat negotiation.',
        'Do not turn the protocol into universal medical advice, especially around pregnancy, female-cycle adjustments, prescriptions, or advanced therapies.',
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
    ],
    sections: {
      habits: [
        'Protect the foundation daily: sleep quality, exercise, nutrition, emotional resilience, and social connection before exotic therapies.',
        'Exercise toward the published baseline: about 6 hours weekly across strength, cardio, flexibility, balance, Zone 2, and vigorous work when appropriate.',
        'Track biological-age, speed-of-aging, blood, imaging, sleep, fitness, oral, skin, and body-composition numbers as claims with source trails and critique links nearby.',
        'Use clinician-guided prevention and routine measurement: bloodwork, glucose monitoring where relevant, annual checks, dentist, eye doctor, and cancer/skin screening.',
        'Keep family, friendship, and community in the protocol because Johnson explicitly lists “love and be loved” as a longevity behavior.',
      ],
      longterm: [
        'Muscle/fat/bone targets: preserve high lean mass, optimal body fat, and bone density rather than chasing scale weight alone.',
        'Cardiovascular/vascular targets: sustain low resting heart rate, healthy blood pressure, and vascular-function claims in the late-teen/early-20s framing only as reported metrics.',
        'Metabolic targets: keep glucose and blood-sugar-control claims in measurement context, with retesting instead of diet ideology.',
        'Aging-speed targets: display epigenetic speed-of-aging, telomere, and “organ age” claims as tracked biomarkers, not guaranteed lifespan outcomes.',
        'Evidence-tier target: separate durable healthspan practices from frontier enhancement, drug-stack, gene-therapy, and immortality narratives.',
      ],
      donts: [
        'Do not render “immortality by 2039” as a realistic forecast or medical endpoint.',
        'Do not collapse Johnson’s ideology, Blueprint marketing, and independent evidence into one confidence level.',
        'Do not imply biomarker optimization automatically proves longer life, fewer events, or lower all-cause mortality for a reader.',
        'Do not glamorize advanced therapies—gene therapy, plasma/stem-cell procedures, HBOT, prescription stacks, or enhancement competition framing—without caveats.',
        'Do not let addiction-pattern inputs dominate: fast food, junk food, smoking, nicotine, vaping, excessive alcohol, social media, or anything addictive.',
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
    ],
    sections: {
      habits: [
        'Make every calorie “fight for its life”: choose nutrient-dense foods and use repeatable meal systems rather than mood-driven eating.',
        'Keep the current published macro frame source-bound: 2,250 calories, about 130 g protein, 206 g carbs, and 101 g fat for Johnson’s routine, not a universal prescription.',
        'Finish the final meal/snack at least four hours before bed so digestion and resting heart rate do not wreck sleep.',
        'Use biomarkers to decide whether foods serve the body rather than identifying with camps such as plant-based, carnivore, keto, or paleo.',
        'For female-cycle guidance, keep phase-aware nutrition in context: higher-carb follicular support, luteal protein/healthy-fat emphasis, hydration/electrolytes, and clinician-aware supplementation.',
      ],
      longterm: [
        'Calorie target: keep moderate restriction and exact calorie numbers tied to Johnson’s sourced routine, with no reader-specific prescription.',
        'Protein target: preserve muscle with adequate protein, including female-cycle and menopause notes where the source gives separate targets.',
        'Metabolic target: support glucose stability and bedtime RHR by avoiding large late meals and retesting relevant biomarkers.',
        'Nutrient-density target: prioritize longevity-food patterns, fiber, healthy fats, micronutrient adequacy, and tested deficiencies over diet identity.',
        'Product-claim target: pair Blueprint foods, supplements, microplastics testing, and metabolic-drug commentary with source paths and independent-evidence caveats.',
      ],
      donts: [
        'Do not publish Johnson’s calorie, macro, supplement-dose, or eating-window numbers as universal targets.',
        'Do not treat metabolic-drug analogies, microplastics product claims, or Blueprint marketing as clinician guidance.',
        'Do not eat close to bed; the protocol frames late meals as a major driver of higher resting heart rate and worse sleep.',
        'Do not rely on nutrition tribal labels; the source says to follow evidence, data, and biomarker response.',
        'Do not let fast food, junk food, fried/highly processed foods, added sugar, excessive alcohol, or stress-eating become default inputs.',
      ],
    },
    cards: [
      {
        label: 'Food pattern',
        title: 'Nutrient-dense, plant-led Blueprint meals',
        body: 'The wiki supports a general food-quality/eating-timing summary. Do not copy prototype calorie, macro, or eating-window numbers unless a source verifies them.',
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
        'Reframe identity: act like a professional sleeper and put sleep as the first appointment the rest of the day works around.',
        'Eat the final meal at least four hours before bed to lower bedtime resting heart rate and protect sleep quality.',
        'Turn screens off 60 minutes before bed and use a wind-down routine: reading, walk, journaling, breathwork, meditation, bath, family, or a friend call.',
        'Keep a consistent bedtime and regulate evening light with red/amber light, blue-light reduction, and a quiet, dark, cool bedroom around 65–70°F.',
        'Get morning light within 15–30 minutes of waking and gather data with a journal, wearable, or tracker to tune the routine.',
      ],
      longterm: [
        'RHR target: lower resting heart rate before bed because Johnson frames it as the single highest-leverage sleep-health behavior.',
        'Consistency target: preserve a stable sleep/wake schedule rather than using occasional recovery nights as the strategy.',
        'Environment target: keep the room quiet, dark, cool, and low-stimulation so the body can wind down predictably.',
        'Measurement target: track sleep habits, patterns, and wearable claims as feedback, not as context-free universal score targets.',
        'Recovery-system target: treat sleep as the foundation that makes exercise, nutrition, emotional resilience, and self-control easier.',
      ],
      donts: [
        'Do not publish unsourced sleep score, REM, HRV, wake-event, or “perfect sleep” targets without source verification.',
        'Do not imply one nap or one night can fully repay circadian disruption, sleep debt, or long-haul travel effects.',
        'Do not eat late, drink alcohol before bed, or take stimulants such as caffeine within the 8–10 hour pre-sleep window.',
        'Do not keep screens, work, texting, partying, rumination, or emotionally charged fights in the final hour before sleep; Johnson says no fights after 5 pm.',
        'Do not normalize chronic short sleep; the source frames sleep deprivation as cognitive, immune, metabolic, and willpower damage.',
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
