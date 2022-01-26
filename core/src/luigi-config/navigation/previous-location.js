const PREVIOUS_LOCATION_KEY = 'busola.location';

export const saveLocation = location => {
  localStorage.setItem(PREVIOUS_LOCATION_KEY, location);
};

export const saveCurrentLocation = () => {
  if (
    !window.location.hash &&
    window.location.pathname !== '/' &&
    window.location.pathname !== '/clusters'
  ) {
    saveLocation(window.location.pathname);
  }
};

export const tryRestorePreviousLocation = () => {
  const prevLocation = localStorage.getItem(PREVIOUS_LOCATION_KEY);
  if (prevLocation) {
    localStorage.removeItem(PREVIOUS_LOCATION_KEY);
    Luigi.navigation().navigate(prevLocation);
  }
};
