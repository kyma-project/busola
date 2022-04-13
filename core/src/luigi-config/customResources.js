let customResources = null;

let customTranslations = null;

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

export async function getCustomTranslations() {
  if (customTranslations) return customTranslations;
  try {
    const cacheBuster = '?cache-buster=' + Date.now();

    const response = await fetch(
      `/assets/customTranslations/customTranslations.json${cacheBuster}`,
    );

    const data = await response.json();
    customResources = data;

    return data;
  } catch (e) {
    console.warn(`Cannot load customTranslations.json: `, e);
    return null;
  }
}
