// default: {legal-disclosure: 'http', privacy: 'https', ...}
// de: {legal-disclosure: 'http', privacy: 'https', ...}

// legal-disclosure: {
//   default: 'http://een',
//   de: 'yadada',
//   ...
// }
// privacy: {
//   default: 'http://'
// }

// setting sideNavFooterText of Luigi settings won't allow HTML
export async function setNavFooterText() {
  const version = await getBusolaVersion();
  getFooterElement().innerHTML = `<ul>
    <li><a href="https://www.sap.com/about/legal/impressum.html">Legal Disclosure</a></li>
    <li><a href="https://www.sap.com/about/legal/privacy.html">Privacy</a></li>
    <li><a href="https://www.sap.com/corporate/en/legal/trademark.html">Trademarks</a></li>
    <li><a href="https://www.sap.com/corporate/en/legal/copyright.html">Copyright</a></li>
  </ul>
  <p>Version: ${version}</p>
  `;
}

async function getBusolaVersion() {
  return await fetch('/assets/version.json')
    .then(response => response.json())
    .then(json => json.version)
    .catch(() => 'unknown');
}

function getFooterElement() {
  return document.querySelector('.lui-side-nav__footer--text');
}
