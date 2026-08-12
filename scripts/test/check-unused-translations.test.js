import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { flattenKeys, findUsedKeys } from '../check-unused-translations.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(
  resolve(__dir, 'fixtures/example-source.txt'),
  'utf8',
);

describe('flattenKeys', () => {
  it('flattens a nested object into dot-separated keys', () => {
    const yaml = {
      common: { buttons: { create: 'Create', cancel: 'Cancel' } },
    };
    expect(flattenKeys(yaml)).toEqual([
      'common.buttons.create',
      'common.buttons.cancel',
    ]);
  });

  it('includes top-level scalar keys', () => {
    expect(flattenKeys({ apps: { title: 'Apps' } })).toEqual(['apps.title']);
  });

  it('handles multiple nesting levels', () => {
    const yaml = { a: { b: { c: 'val' } } };
    expect(flattenKeys(yaml)).toEqual(['a.b.c']);
  });
});

describe('findUsedKeys', () => {
  const allKeys = [
    'common.buttons.create', // single quotes
    'common.buttons.cancel', // double quotes
    'common.buttons.delete', // backtick static
    'common.buttons.edit', // multiline call
    'apps.title', // indirect via data structure
    'upload-yaml.info', // i18nKey prop
    'common.value-units.seconds-ago', // template literal prefix
    'common.value-units.minutes-ago', // template literal prefix (same prefix, different key)
    'cron-jobs.create-modal.minute', // string concatenation
    'cron-jobs.create-modal.hour', // string concatenation (same prefix, different key)
    'extensibility.sections.general', // tExt template literal
    'unused.key.example', // must NOT be detected
  ];

  const { used } = findUsedKeys(allKeys, fixture);

  it("detects single-quoted key: t('key')", () => {
    expect(used.has('common.buttons.create')).toBe(true);
  });

  it('detects double-quoted key: t("key")', () => {
    expect(used.has('common.buttons.cancel')).toBe(true);
  });

  it('detects backtick static key: t(`key`)', () => {
    expect(used.has('common.buttons.delete')).toBe(true);
  });

  it('detects key on next line after t(', () => {
    expect(used.has('common.buttons.edit')).toBe(true);
  });

  it('detects key in a data structure (indirect usage)', () => {
    expect(used.has('apps.title')).toBe(true);
  });

  it('detects i18nKey prop', () => {
    expect(used.has('upload-yaml.info')).toBe(true);
  });

  it('detects keys via template literal prefix: t(`prefix.${expr}`)', () => {
    expect(used.has('common.value-units.seconds-ago')).toBe(true);
    expect(used.has('common.value-units.minutes-ago')).toBe(true);
  });

  it("detects keys via string concatenation: t('prefix.' + expr)", () => {
    expect(used.has('cron-jobs.create-modal.minute')).toBe(true);
    expect(used.has('cron-jobs.create-modal.hour')).toBe(true);
  });

  it('detects keys via tExt template literal', () => {
    expect(used.has('extensibility.sections.general')).toBe(true);
  });

  it('does not mark unreferenced keys as used', () => {
    expect(used.has('unused.key.example')).toBe(false);
  });
});
