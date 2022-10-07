export const loadingState = {
  setLoading: loading => {
    const visibility = loading ? 'visible' : 'hidden';
    document
      .querySelectorAll('#spinner, #overlay')
      .forEach(e => (e.style.visibility = visibility));
  },
};
