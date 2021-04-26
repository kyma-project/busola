import { v4 as uuid } from 'uuid';

export function fromEntries(entries) {
  return Object.fromEntries(entries.map(e => [e.key, e.value]));
}

export function toEntries(object) {
  return Object.entries(object).map(([key, value]) => ({
    renderId: uuid(),
    key,
    value,
  }));
}

export function readFromFile() {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) resolve(null);
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = e =>
        resolve({ name: file.name, content: e.target.result });
    });
    input.click();
  });
}
