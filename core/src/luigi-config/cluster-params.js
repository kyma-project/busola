let params = null;

export async function getClusterParams() {
  if (!params) {
    try {
      const cacheBuster = '?cache-buster=' + Date.now();
      const response = await fetch('/assets/config/config.json' + cacheBuster);
      params = await response.json();
      console.log('cluster params:', params);
    } catch (e) {
      console.warn('Cannot load cluster params: ', e);
      params = {};
    }
  }
  return params;
}
