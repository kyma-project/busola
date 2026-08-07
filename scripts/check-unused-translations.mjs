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

// 2. Walk source files and build a single searchable string
const allSource = walkFiles(SRC)
  .map(f => readFileSync(f, 'utf8'))
  .join('\n');

// Static: a key is used if it appears as a quoted string literal anywhere in source.
let staticMatches = 0;
for (const key of allKeys) {
  if (
    allSource.includes(`'${key}'`) ||
    allSource.includes(`"${key}"`) ||
    allSource.includes(`\`${key}\``)
  ) {
    counts.set(key, 1);
    staticMatches++;
  }
}

// Dynamic: extract the static prefix from t(`prefix.${expr}`) or t('prefix.' + expr),
// then mark all YAML keys that start with that prefix as used.

// t(`prefix.${expr}`) — marks all YAML keys starting with the static prefix
const RE_DYNAMIC = /`([a-z][a-z0-9.-]*[.-])\$\{/g;
// t('prefix.' + expr) — marks all YAML keys starting with the static prefix
const RE_CONCAT = /(?:t|tExt)\(\s*['"]([a-z][a-z0-9.-]+[.-])['"]\s*\+/g;

let dynamicMatches = 0;
for (const re of [RE_DYNAMIC, RE_CONCAT]) {
  let m;
  while ((m = re.exec(allSource)) !== null) {
    const prefix = m[1];
    if (!prefix.slice(0, -1)) continue;
    for (const k of counts.keys()) {
      if (k.startsWith(prefix) && counts.get(k) === 0) {
        counts.set(k, 1);
        dynamicMatches++;
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
