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
