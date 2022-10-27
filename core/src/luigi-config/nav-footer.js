import i18next from 'i18next';
import jsyaml from 'js-yaml';
import { getBusolaClusterParams } from './busola-cluster-params';

export function elementReady(selector) {
  return new Promise(resolve => {
    new MutationObserver((_, observer) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        observer.disconnect();
      }
    }).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
}

// setting sideNavFooterText of Luigi settings won't allow HTML
export async function setNavFooterText() {
  elementReady('.lui-side-nav__footer--text').then(async targetElement => {
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
  });
}

async function getBusolaVersion() {
  return await fetch('/assets/version.yaml')
    .then(response => response.text())
    .then(text => jsyaml.load(text).version)
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
