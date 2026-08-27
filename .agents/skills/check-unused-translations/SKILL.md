---
name: check-unused-translations
description: Finds translation keys in public/i18n/en.yaml that are not used anywhere in the src/ source code. Trigger keywords - "unused translations", "check translations", "dead translations", "translation cleanup".
---

# Check Unused Translations

Finds translation keys in `public/i18n/en.yaml` that are not referenced in `src/`.

## Step 1: Collect all translation keys

Read `public/i18n/en.yaml` and flatten its nested structure into dot-separated keys.
For example:

```yaml
common:
  buttons:
    create: Create
```

becomes `common.buttons.create`.

## Step 2: Read all source files

Collect the full text of every `.ts`, `.tsx`, `.js`, `.jsx` file under `src/`.

## Step 3: Check each key for usage

A key is **used** if any of the following is true:

1. **Quoted literal** — the string `'key'`, `"key"`, or `` `key` `` appears anywhere in source.
   Covers `t('key')`, `i18nKey="key"`, and keys stored in data structures and passed to `t()` indirectly (e.g. navigation category labels like `label: 'apps.title'`).

2. **Template literal prefix** — a backtick string of the form `` `prefix.${expr}` `` or `` `prefix-${expr}` `` exists in source, where the key starts with `prefix.` or `prefix-`.
   Example: ``t(`command-palette.resource-names.${type}`)`` covers all `command-palette.resource-names.*` keys.

3. **Concatenation prefix** — a call of the form `t('prefix.' + expr)` exists in source, where the key starts with `prefix.`.
   Example: `t('cron-jobs.create-modal.' + name)` covers all `cron-jobs.create-modal.*` keys.

## Step 4: Report unused keys

Print every key that matched none of the above conditions.

## Output

Report only — do not modify any files. Print the unused keys as a simple list with a one-line summary (total keys, used, unused).
