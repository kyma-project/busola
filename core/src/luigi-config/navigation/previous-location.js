const PREVIOUS_LOCATION_KEY = 'busola.location';

export const saveLocation = location => {
  localStorage.setItem(PREVIOUS_LOCATION_KEY, location);
};

export const saveCurrentLocation = () => {
  const searchParams = [
    ...(new URL(window.location).searchParams?.keys() || []),
  ];
  const hasInitParams =
    searchParams.includes('init') || searchParams.includes('kubeconfigID');

  if (
    !window.location.hash &&
    !hasInitParams &&
    window.location.pathname !== '/'
  ) {
    const location = window.location.pathname;
    const params = window.location.search;
    saveLocation(location + params);
  }
};

export const tryRestorePreviousLocation = () => {
  const prevLocation = localStorage.getItem(PREVIOUS_LOCATION_KEY);
  if (prevLocation) {
    localStorage.removeItem(PREVIOUS_LOCATION_KEY);
    Luigi.navigation().navigate(prevLocation);
  }
};
