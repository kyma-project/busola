import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'js-yaml';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '..');
const SRC = resolve(ROOT, 'src');
const SOURCE_EXTS = ['.ts', '.tsx', '.js', '.jsx'];

// 1. Load and flatten all translation keys from en.yaml
const yaml = load(readFileSync(resolve(ROOT, 'public/i18n/en.yaml'), 'utf8'));

function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...flattenKeys(v, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

const allKeys = flattenKeys(yaml);
const counts = new Map(allKeys.map(k => [k, 0]));
console.log(`Loaded ${allKeys.length} translation keys from en.yaml\n`);

// 2. Walk source files and extract translation key references

// t('key') / tExt(`key`) — \s* handles keys on the next line after the opening paren
const RE_STATIC = /(?:t|tExt)\(\s*[`'"]([^`'"$\n]+)[`'"]/g;

// any quoted string that looks like a.translation.key — catches keys stored in data
// structures and passed to t() indirectly (e.g. category label: 'apps.title')
const RE_ANY_STRING = /['"]([a-zA-Z][a-zA-Z0-9_-]+(?:\.[a-zA-Z][a-zA-Z0-9_-]+){1,})['"]/g;

// <Trans i18nKey="key"> / i18nKey={'key'} / i18nKey: 'key'
const RE_I18N_KEY = /i18nKey[=:]\s*\{?['"]([^'"]+)['"]\}?/g;

// const i18nDescriptionKey = 'some.key'
const RE_DESC_KEY = /i18nDescriptionKey\s*=\s*['"]([^'"]+)['"]/g;

// subtitleText: 'some.key'
const RE_SUBTITLE = /subtitleText:\s*['"]([^'"]+)['"]/g;

// t(`prefix.${expr}`) — marks all YAML keys starting with the static prefix
const RE_DYNAMIC = /`([a-z][a-z0-9.-]*[.-])\$\{/g;
// t('prefix.' + expr) — marks all YAML keys starting with the static prefix
const RE_CONCAT = /(?:t|tExt)\(\s*['"]([a-z][a-z0-9.-]+[.-])['"]\s*\+/g;

function walkFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(full));
    } else if (SOURCE_EXTS.some(ext => entry.name.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

let staticMatches = 0;
let dynamicMatches = 0;

for (const file of walkFiles(SRC)) {
  const content = readFileSync(file, 'utf8');

  for (const re of [RE_STATIC, RE_I18N_KEY, RE_DESC_KEY, RE_SUBTITLE, RE_ANY_STRING]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(content)) !== null) {
      const key = m[1];
      if (counts.has(key)) {
        counts.set(key, counts.get(key) + 1);
        staticMatches++;
      }
    }
  }

  for (const re of [RE_DYNAMIC, RE_CONCAT]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(content)) !== null) {
      const prefix = m[1];
      if (!prefix.slice(0, -1)) continue;
      for (const k of counts.keys()) {
        if (k.startsWith(prefix)) {
          counts.set(k, counts.get(k) + 1);
          dynamicMatches++;
        }
      }
    }
  }
}

// 3. Report
const unused = allKeys.filter(k => counts.get(k) === 0);

console.log(`Static key matches:  ${staticMatches}`);
console.log(`Dynamic prefix hits: ${dynamicMatches}`);
console.log(`Used keys:           ${allKeys.length - unused.length}`);
console.log(`Unused keys:         ${unused.length}\n`);

if (unused.length === 0) {
  console.log('No unused keys found.');
} else {
  console.log('Unused translation keys:');
  for (const key of unused) {
    console.log(`  ${key}`);
  }
}
