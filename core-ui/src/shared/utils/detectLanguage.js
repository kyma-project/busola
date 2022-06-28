import flourite from 'flourite';

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
