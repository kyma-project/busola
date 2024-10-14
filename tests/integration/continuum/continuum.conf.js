window.LevelAccess_AccessContinuumConfiguration = {
  accessEngineType: 'professional',
  ampInstanceUrl: 'https://sap.levelaccess.net',
  defaultStandardIds: [
    1001235 /*SAP Standards*/,
    610 /* WCAG 2.0 Level A */,
    611 /* WCAG 2.0 Level AA */,
    612 /* WCAG 2.0 Level AAA */,
    1387 /* WCAG 2.1 Level A */,
    1388 /* WCAG 2.1 Level AA */,
    1389 /* WCAG 2.1 Level AAA */,
    1140 /* Section 508 and 255 (Revised 2017) */,
    1471 /* WCAG 2.0 Level A & AA Baseline */,
  ],
  includePotentialAccessibilityConcerns: false,
  ampApiToken: Cypress.env('ACC_AMP_TOKEN'),
  accessibilityConcerns: {
    includePotentialConcerns: false,
    format: 'amp',
  },
  elevin: {
    baseUrl: null,
    apiKey: null,
  },
};
