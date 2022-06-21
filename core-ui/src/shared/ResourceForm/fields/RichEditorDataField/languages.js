import flourite from 'flourite';
import { languages } from 'monaco-editor';

export function detectLanguage(text) {
  const { statistics } = flourite(text || '');
  delete statistics['Julia']; // Julia language messes up with JS
  return Object.entries(statistics || {})
    .reduce(
      (max, [key, value]) => {
        if (value > max.value) {
          return { key, value };
        }
        return max;
      },
      { key: '', value: 0 },
    )
    .key.toLowerCase();
}

export function getAvailableLanguages() {
  return languages.getLanguages().sort((a, b) => a.id.localeCompare(b.id));
}
