export async function loadConfigFile(filename) {
  try {
    const cacheBuster = '?cache-buster=' + Date.now();

    const response = await fetch(`/assets/ext/${filename}${cacheBuster}`);

    return await response.json();
  } catch (e) {
    console.warn(`Cannot load ${filename}: `, e);
    return null;
  }
}
