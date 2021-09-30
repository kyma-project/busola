const PREVIOUS_LOCATION_KEY = 'busola.location';

export const saveLocation = location => {
  console.log('save location', location);
  localStorage.setItem(PREVIOUS_LOCATION_KEY, location);
};

function hasQueryParams() {
  const searchParams = [
    ...(new URL(window.location).searchParams?.keys() || []),
  ];
  return searchParams.includes('init') || searchParams.includes('kubeconfigID');
}

export const saveCurrentLocation = () => {
  if (
    !window.location.hash &&
    window.location.pathname !== '/' &&
    !hasQueryParams()
  ) {
    const location = window.location.pathname;
    const params = window.location.search;
    saveLocation(location + params);
  }
};

export const tryRestorePreviousLocation = () => {
  const prevLocation = localStorage.getItem(PREVIOUS_LOCATION_KEY);
  console.log('restore location', prevLocation);
  if (prevLocation) {
    localStorage.removeItem(PREVIOUS_LOCATION_KEY);
    // this is absolutely lame, but it won't work without setTimeout
    setTimeout(() => {
      Luigi.navigation().navigate(prevLocation);
    });
  }
};
