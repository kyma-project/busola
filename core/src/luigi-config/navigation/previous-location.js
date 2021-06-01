const PREVIOUS_LOCATION_KEY = 'busola.location';

export const saveLocation = location => {
  console.log('save', location);
  localStorage.setItem(PREVIOUS_LOCATION_KEY, location);
};

export const saveCurrentLocation = () => {
  // && window.location.pathname !== '/'
  if (!window.location.hash) {
    const location = window.location.pathname;
    const params = window.location.search;
    saveLocation(location + params);
    console.log('save curr', location + params);
  }
};

export const tryRestorePreviousLocation = () => {
  const prevLocation = localStorage.getItem(PREVIOUS_LOCATION_KEY);
  if (prevLocation) {
    console.log('load', prevLocation);
    localStorage.removeItem(PREVIOUS_LOCATION_KEY);
    Luigi.navigation().navigate(prevLocation);
  }
};
