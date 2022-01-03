import i18next from 'i18next';
import { getBusolaClusterParams } from './busola-cluster-params';

function elementReady(selector) {
  return new Promise(resolve => {
    let el = document.querySelector(selector);
    if (el) {
      resolve(el);
      return;
    }
    new MutationObserver((_, observer) => {
      // Query for elements matching the specified selector
      Array.from(document.querySelectorAll(selector)).forEach(element => {
        resolve(element);
        observer.disconnect();
      });
    }).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
}

// setting sideNavFooterText of Luigi settings won't allow HTML
export async function setNavFooterText() {
  const targetElement = await elementReady('.lui-side-nav__footer--text');

  const language = i18next.language;
  const version = await getBusolaVersion();
  const feature = (await getBusolaClusterParams()).config?.features
    ?.LEGAL_LINKS;

  const versionText = i18next.t('common.labels.version');
  const versionLink = checkVersionLink(version);

  targetElement.innerHTML = `
    <ul>
      ${Object.entries(feature?.config || {})
        .map(([key, value]) => {
          const text = i18next.t('legal.' + key);
          const link = value[language] || value.default;
          return `<li><a href="${link}" target="_blank" rel="noopener noreferrer">${text}</a></li>`;
        })
        .join('')}
    </ul>
    <p>${versionText}:</p><a href="${versionLink}" target="_blank" rel="noopener noreferrer" data-test-id="version-link">${version}</a>`;
}

async function getBusolaVersion() {
  return await fetch('/assets/version.json')
    .then(response => response.json())
    .then(json => json.version)
    .catch(() => 'unknown');
}

function checkVersionLink(version) {
  if (version !== 'dev' && version !== 'unknown') {
    if (version.startsWith('PR-')) {
      return `https://github.com/kyma-project/busola/pull/${version.slice(3)}`;
    } else return `https://github.com/kyma-project/busola/commit/${version}`;
  } else {
    return `https://github.com/kyma-project/busola`;
  }
}
