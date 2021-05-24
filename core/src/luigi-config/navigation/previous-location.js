const PREVIOUS_LOCATION_KEY = 'busola.location';

export const saveLocation = location => {
  localStorage.setItem(PREVIOUS_LOCATION_KEY, location);
};

export const saveCurrentLocation = () => {
  if (!window.location.hash) {
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
