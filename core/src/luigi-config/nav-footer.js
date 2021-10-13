import i18next from 'i18next';
import { getBusolaClusterParams } from './busola-cluster-params';

// setting sideNavFooterText of Luigi settings won't allow HTML
export async function setNavFooterText() {
  const targetElement = document.querySelector('.fd-side-nav');

  // we can't add footer if left nav is hidden
  if (!targetElement) return;

  // the footer is already here
  if (document.querySelector('.lui-side-nav__footer')) return;

  const language = i18next.language;
  const version = await getBusolaVersion();
  const feature = (await getBusolaClusterParams()).config?.features
    ?.LEGAL_LINKS;

  const div = document.createElement('div');
  div.className = 'fd-side-nav__utility svelte-wcwm9c';
  div.innerHTML = `
  <span class="lui-side-nav__footer svelte-wcwm9c">
    <span class="lui-side-nav__footer--text fd-has-type-minus-1 svelte-wcwm9c">
      <ul>
        ${Object.entries(feature.config || {})
          .map(([key, value]) => {
            const text = i18next.t('legal.' + key);
            const link = value[language] || value.default;
            return `<li><a href="${link}" target="_blank" rel="noopener noreferrer">${text}</a></li>`;
          })
          .join('')}
      </ul>
      <p>Version: ${version}</p>
    </span>
  </span>`;
  targetElement.appendChild(div);
}

async function getBusolaVersion() {
  return await fetch('/assets/version.json')
    .then(response => response.json())
    .then(json => json.version)
    .catch(() => 'unknown');
}
