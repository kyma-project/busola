import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'js-yaml';
import { flattenKeys, findUsedKeys } from '../check-unused-translations.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const FIXTURES = resolve(__dir, 'fixtures');

const yaml = load(readFileSync(resolve(FIXTURES, 'fake.en.yaml'), 'utf8'));
const allKeys = flattenKeys(yaml);
const source = [
  readFileSync(resolve(FIXTURES, 'fake-resource-list.jsx'), 'utf8'),
  readFileSync(resolve(FIXTURES, 'fake-resource-details.jsx'), 'utf8'),
].join('\n');

const { used } = findUsedKeys(allKeys, source);
const unused = allKeys.filter((k) => !used.has(k));

const EXPECTED_UNUSED = [
  'translation.single-quotes.unused',
  'translation.double-quotes.unused',
  'translation.backtick.unused',
  'translation.multiline.unused',
  'translation.template.unused',
  'translation.concat.unused',
  'translation.text-variant.unused',
  'translation.trans.unused',
  'translation.description-key.unused',
  'translation.nav-label.unused',
];

describe('check-unused-translations', () => {
  it('detects all unused keys and no more', () => {
    expect(unused.sort()).toEqual(EXPECTED_UNUSED.sort());
  });
});
