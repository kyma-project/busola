const TINY_SPACE = '0.5rem';
const SMALL_SPACE = '1rem';
const MEDIUM_SPACE = '2rem';
const LARGE_SPACE = '3rem';

/*
 * ###################################################
 * Margin Classes
 * ###################################################
 */

// All Around Margins
const sapUiTinyMargin = { margin: TINY_SPACE };
const sapUiSmallMargin = { margin: SMALL_SPACE };
const sapUiMediumMargin = { margin: MEDIUM_SPACE };
const sapUiLargeMargin = { margin: LARGE_SPACE };

// Single Side Margins
const sapUiTinyMarginTop = { marginTop: TINY_SPACE };
const sapUiTinyMarginBottom = { marginBottom: TINY_SPACE };
const sapUiTinyMarginBegin = { marginLeft: TINY_SPACE };
const sapUiTinyMarginEnd = { marginRight: TINY_SPACE };

const sapUiSmallMarginTop = { marginTop: SMALL_SPACE };
const sapUiSmallMarginBottom = { marginBottom: SMALL_SPACE };
const sapUiSmallMarginBegin = { marginLeft: SMALL_SPACE };
const sapUiSmallMarginEnd = { marginRight: SMALL_SPACE };

const sapUiMediumMarginTop = { marginTop: MEDIUM_SPACE };
const sapUiMediumMarginBottom = { marginBottom: MEDIUM_SPACE };
const sapUiMediumMarginBegin = { marginLeft: MEDIUM_SPACE };
const sapUiMediumMarginEnd = { marginRight: MEDIUM_SPACE };

const sapUiLargeMarginTop = { marginTop: LARGE_SPACE };
const sapUiLargeMarginBottom = { marginBottom: LARGE_SPACE };
const sapUiLargeMarginBegin = { marginLeft: LARGE_SPACE };
const sapUiLargeMarginEnd = { marginRight: LARGE_SPACE };

// Two Sided Margins
const sapUiTinyMarginBeginEnd = {
  ...sapUiTinyMarginBegin,
  ...sapUiTinyMarginEnd,
};
const sapUiTinyMarginTopBottom = {
  ...sapUiTinyMarginTop,
  ...sapUiTinyMarginBottom,
};

const sapUiSmallMarginBeginEnd = {
  ...sapUiSmallMarginBegin,
  ...sapUiSmallMarginEnd,
};
const sapUiSmallMarginTopBottom = {
  ...sapUiSmallMarginTop,
  ...sapUiSmallMarginBottom,
};

const sapUiMediumMarginBeginEnd = {
  ...sapUiMediumMarginBegin,
  ...sapUiMediumMarginEnd,
};
const sapUiMediumMarginTopBottom = {
  ...sapUiMediumMarginTop,
  ...sapUiMediumMarginBottom,
};

const sapUiLargeMarginBeginEnd = {
  ...sapUiLargeMarginBegin,
  ...sapUiLargeMarginEnd,
};
const sapUiLargeMarginTopBottom = {
  ...sapUiLargeMarginTop,
  ...sapUiLargeMarginBottom,
};

// Remove Margins
const sapUiNoMargin = { margin: '0 !important' };
const sapUiNoMarginTop = { marginTop: '0 !important' };
const sapUiNoMarginBottom = { marginBottom: '0 !important' };
const sapUiNoMarginBegin = { marginLeft: '0 !important' };
const sapUiNoMarginEnd = { marginRight: '0 !important' };

// Negative Margins
const sapUiTinyNegativeMarginBeginEnd = { margin: '0 -0.5rem !important' };
const sapUiSmallNegativeMarginBeginEnd = { margin: '0 -1rem !important' };
const sapUiMediumNegativeMarginBeginEnd = { margin: '0 -2rem !important' };
const sapUiLargeNegativeMarginBeginEnd = { margin: '0 -3rem !important' };

// Force Auto Width
const sapUiForceWidthAuto = { width: 'auto !important' };

// Responsive Margins
const sapUiResponsiveMargin = {
  '@media(max-width:599px)': { margin: '0 0 1rem 0' },
  '@media (min-width:600px) and (max-width:1023px)': {
    margin: '1rem !important',
  },
  '@media (min-width:1024px) and (max-width: 1439px)': {
    margin: '1rem 2rem !important',
  },
  '@media (min-width:1440px)': { margin: '1rem 3rem !important' },
};

/*
 * ###################################################
 * Padding Classes
 * ###################################################
 */

// Padding
const sapUiNoContentPadding = { padding: '0 !important' };
const sapUiContentPadding = { padding: '1rem' };

// Two Sided Padding
const sapUiTinyPaddingBeginEnd = {
  paddingLeft: '0.5rem !important',
  paddingRight: '0.5rem !important',
};

const sapUiSmallPaddingBeginEnd = {
  paddingLeft: '1rem !important',
  paddingRight: '1rem !important',
};

const sapUiMediumPaddingBeginEnd = {
  paddingLeft: '2rem !important',
  paddingRight: '2rem !important',
};

const sapUiLargePaddingBeginEnd = {
  paddingLeft: '3rem !important',
  paddingRight: '3rem !important',
};

// Responsive Padding
const sapUiResponsiveContentPadding = {
  '@media(max-width:599px)': { paddingLeft: '1rem', paddingRight: '1rem' },
  '@media (min-width:600px) and (max-width:1023px)': {
    paddingLeft: '2rem',
    paddingRight: '2rem',
  },
  '@media (min-width:1024px) and (max-width: 1439px)': {
    paddingLeft: '2rem',
    paddingRight: '2rem',
  },
  '@media (min-width:1440px)': { paddingLeft: '3rem', paddingRight: '3rem' },
};

// Export everything in a single object like `spacing`
export const spacing = {
  sapUiTinyMargin,
  sapUiSmallMargin,
  sapUiMediumMargin,
  sapUiLargeMargin,

  sapUiTinyMarginTop,
  sapUiTinyMarginBottom,
  sapUiTinyMarginBegin,
  sapUiTinyMarginEnd,

  sapUiSmallMarginTop,
  sapUiSmallMarginBottom,
  sapUiSmallMarginBegin,
  sapUiSmallMarginEnd,

  sapUiMediumMarginTop,
  sapUiMediumMarginBottom,
  sapUiMediumMarginBegin,
  sapUiMediumMarginEnd,

  sapUiLargeMarginTop,
  sapUiLargeMarginBottom,
  sapUiLargeMarginBegin,
  sapUiLargeMarginEnd,

  sapUiTinyMarginBeginEnd,
  sapUiTinyMarginTopBottom,

  sapUiSmallMarginBeginEnd,
  sapUiSmallMarginTopBottom,

  sapUiMediumMarginBeginEnd,
  sapUiMediumMarginTopBottom,

  sapUiLargeMarginBeginEnd,
  sapUiLargeMarginTopBottom,

  sapUiNoMargin,
  sapUiNoMarginTop,
  sapUiNoMarginBottom,
  sapUiNoMarginBegin,
  sapUiNoMarginEnd,

  sapUiTinyNegativeMarginBeginEnd,
  sapUiSmallNegativeMarginBeginEnd,
  sapUiMediumNegativeMarginBeginEnd,
  sapUiLargeNegativeMarginBeginEnd,

  sapUiForceWidthAuto,
  sapUiResponsiveMargin,

  sapUiNoContentPadding,
  sapUiContentPadding,

  sapUiTinyPaddingBeginEnd,
  sapUiSmallPaddingBeginEnd,
  sapUiMediumPaddingBeginEnd,
  sapUiLargePaddingBeginEnd,

  sapUiResponsiveContentPadding,
};
