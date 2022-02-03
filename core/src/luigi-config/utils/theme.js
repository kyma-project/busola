export function setTheme(name) {
  localStorage.setItem('busola.theme', name);
  const link = document.querySelector('head #_theme');
  if (name === 'light' && link) {
    link.parentNode.removeChild(link);
  }
  if (!link) {
    addLinkNode();
    return setTheme(name);
  }
  link.href = `/assets/libs/themes/${name}.css`;

  const logo = document.querySelector('[data-testid="luigi-topnav-logo"]');
  if (logo !== null) {
    logo.src =
      name === 'hcw' || name === 'horizon'
        ? 'assets/logo-black.svg'
        : 'assets/logo.svg';
  }
}

function addLinkNode() {
  const newLink = document.createElement('link');
  newLink.id = '_theme';
  newLink.rel = 'stylesheet';
  document.head.appendChild(newLink);
}

export const getTheme = () => {
  return localStorage.getItem('busola.theme') || 'light_dark';
};

export function initTheme() {
  setTheme(getTheme());

  window.addEventListener(
    'message',
    event => {
      if (event.data.msg === 'busola.getCurrentTheme') {
        event.source &&
          event.source.postMessage(
            { msg: 'busola.getCurrentTheme.response', name: getTheme() },
            event.origin,
          );
      }
    },
    false,
  );
}
