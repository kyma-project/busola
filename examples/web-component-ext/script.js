class MyComponent1 extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '';
    // create elements programmatically
    const button = document.createElement('ui5-button');
    button.textContent = 'Offerings';
    button.design = 'Emphasized';
    this.appendChild(button);
    const contentDiv = document.createElement('div');
    this.appendChild(contentDiv);
    button.addEventListener('click', async () => {
      const fetchFn = window.kymaFetchFn;
      if (!fetchFn) {
        alert('Kyma fetch function is not available');
        return;
      }
      let secret = await getSMsecret();
      let token = await getServiceManagerToken(secret);
      let offerings = await getServiceOfferings(token, secret.sm_url);
      contentDiv.innerHTML = '';
      for (let offering of offerings) {
        contentDiv.appendChild(offeringCard(offering));
      }
    });
  }
}
if (!customElements.get('my-component-1')) {
  customElements.define('my-component-1', MyComponent1);
}
function decodeBase64(base64) {
  const raw = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  return new TextDecoder().decode(raw);
}

async function getSMsecret() {
  let url = `/api/v1/namespaces/kyma-system/secrets/sap-btp-service-operator`;
  const fetchFn = window.kymaFetchFn;

  let resp = await fetchFn({ relativeUrl: url });
  let data = await resp.json();
  let secret = data.data;
  for (const key in secret) {
    secret[key] = decodeBase64(secret[key]);
  }
  return secret;
}

async function getServiceManagerToken(secret) {
  const client_id = secret.clientid;
  const client_secret = secret.clientsecret;
  const tokenurl = secret.tokenurl + secret.tokenurlsuffix;
  const grant_type = 'client_credentials';
  //fetch token
  let resp = await fetch(tokenurl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `client_id=${client_id}&client_secret=${client_secret}&grant_type=${grant_type}`,
  });
  let data = await resp.json();
  let accessToken = data.access_token;
  return accessToken;
}

async function getServiceOfferings(token, url) {
  let resp = await proxyFetch(url + '/v1/service_offerings', {
    method: 'GET',
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  let data = await resp.json();
  return data.items;
}

function getProxyAddress() {
  // dev busola
  if (window.location.hostname.startsWith('localhost')) {
    return 'http://localhost:3001/proxy';
    // on cluster
  } else {
    return '/proxy';
  }
}

function proxyFetch(url, options = {}) {
  let proxyUrl = getProxyAddress() + `?url=${url}`;
  let newOptions = {
    ...options,
    headers: {
      ...options.headers,
    },
  };
  if (options.headers && options.headers['authorization']) {
    newOptions.headers['x-authorization'] = options.headers['authorization'];
    delete newOptions.headers['authorization'];
  }
  return fetch(proxyUrl, options);
}

function offeringCard(offering) {
  let card = document.createElement('ui5-card');
  let header = document.createElement('ui5-card-header');
  // header.slot = 'header';
  header.setAttribute('title-text', offering.catalog_name);
  header.setAttribute('subtitle-text', offering.description);
  let cardContent = document.createElement('div');
  cardContent.innerHTML = `<br/><p><b>TODO:</b> service plans</p></br>`;
  card.appendChild(header);
  card.appendChild(cardContent);
  return card;
}
