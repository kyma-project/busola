let customResources = null;

export async function getCustomResources() {
  if (customResources) return customResources;
  try {
    const cacheBuster = '?cache-buster=' + Date.now();

    const response = await fetch(
      `/assets/customResources/customResources.json${cacheBuster}`,
    );

    const data = await response.json();
    customResources = data;

    return data;
  } catch (e) {
    console.warn(`Cannot load customResources.json: `, e);
    return null;
  }
}
