const PREVIOUS_LOCATION_KEY = 'busola.location';

export const saveLocation = location => {
  sessionStorage.setItem(PREVIOUS_LOCATION_KEY, location);
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
    window.location.pathname !== '/clusters' &&
    !hasQueryParams()
  ) {
    const location = window.location.pathname;
    const params = window.location.search;
    saveLocation(location + params);
  }
};

export const tryRestorePreviousLocation = () => {
  const prevLocation = sessionStorage.getItem(PREVIOUS_LOCATION_KEY);
  sessionStorage.removeItem(PREVIOUS_LOCATION_KEY);

  if (prevLocation) {
    setTimeout(() => {
      Luigi.navigation().navigate(prevLocation);
    });
  }
};
