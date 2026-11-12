// @ts-check
import base from './playwright.performance.config.js';

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  ...base,
  reporter: 'list',
  use: { ...base.use, trace: 'on' }, // heavy tracing, debugging only — not for measurement
};

export default config;
