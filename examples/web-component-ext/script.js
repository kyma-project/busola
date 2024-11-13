class MyComponent1 extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    let style = styling();
    shadow.appendChild(style);

    // create elements programmatically
    const button = document.createElement('ui5-button');
    button.textContent = 'Load offerings';
    button.design = 'Emphasized';
    shadow.appendChild(button);
    const contentDiv = document.createElement('div');
    shadow.appendChild(contentDiv);
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
      for (let i = 0; i < offerings.length; i++) {
        contentDiv.appendChild(offeringCard(offerings[i], i, offerings.length));
      }
    });
  }
}

function styling() {
  const style = document.createElement('style');
  style.textContent = `
    .content-group {
      padding: 1rem;
    }
  `;
  return style;
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
  let resp = await proxyFetch(tokenurl, {
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
  return fetch(proxyUrl, options);
}

function offeringCard(offering, index, total) {
  const greyImg =
    'data:image/svg+xml;base64,PHN2ZyBpZD0icGxhY2Vob2xkZXIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDU2IDU2Ij48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6IzVhN2E5NDt9LmNscy0ye2ZpbGw6IzA0OTFkMDt9PC9zdHlsZT48L2RlZnM+PHRpdGxlPnBsYWNlaG9sZGVyPC90aXRsZT48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik00Ni45NTMsMjAuNTg4YTQuMzYzLDQuMzYzLDAsMCwwLTEuODM3LS40NTksMy4yOTEsMy4yOTEsMCwwLDAtMy40LDMuMzc2LDQuMDg0LDQuMDg0LDAsMCwwLC45LDIuNjI1LDMuMDExLDMuMDExLDAsMCwwLDIuNSwxLjEyNiwzLjA4NSwzLjA4NSwwLDAsMCwxLjQ2Mi0uMzc1LDcuNTEyLDcuNTEyLDAsMCwwLDEuMzItLjg5MSwxMC4xMzUsMTAuMTM1LDAsMCwxLDEuMjI2LS44OTEsMi4yNywyLjI3LDAsMCwxLDEuMTc5LS4zNzVBMS41LDEuNSwwLDAsMSw1MiwyNi40MTJWMzkuMDcxYTIuODQzLDIuODQzLDAsMCwxLS41NzYsMiwyLjkyNiwyLjkyNiwwLDAsMS0yLjE1OS42MjZxLTIuOTIzLDAtNC4zODUuMDQ3dC0yLjEyMi4wNDdINDEuOTFhMy4zMjEsMy4zMjEsMCwwLDAsLjYuNjQ0LDUuNzE3LDUuNzE3LDAsMCwxLDIuMDc0LDQuMjIsNS4wNTQsNS4wNTQsMCwwLDEtMS42NSwzLjc1MUE1LjMzMSw1LjMzMSwwLDAsMSwzOS4xMTgsNTJhNS42LDUuNiwwLDAsMS00LjA1NS0xLjU0Nyw1LjA3MSw1LjA3MSwwLDAsMS0xLjYtMy44LDQuODYyLDQuODYyLDAsMCwxLC41MTktMi4zLDExLjQwNywxMS40MDcsMCwwLDEsMS41MTYtMS45NywyLjMzMywyLjMzMywwLDAsMCwuNDc1LS42OUgyOC4zM2ExLjM5NCwxLjM5NCwwLDAsMS0xLjA4NC0uNDY5LDIuMDExLDIuMDExLDAsMCwxLS41MTktMS4wMzJWMTUuOTA5YTEuOCwxLjgsMCwwLDEsLjQyNC0xLjE3MiwxLjQ0NCwxLjQ0NCwwLDAsMSwxLjE3OS0uNTE2aDcuNzMzYTEuOTQ5LDEuOTQ5LDAsMCwwLS4zNzctLjU2MmwtLjgtMS4xNzFhOC43ODgsOC43ODgsMCwwLDEtLjg0Ny0xLjUsNC43ODMsNC43ODMsMCwwLDEtLjQwNi0xLjY3NkE1LjM0OCw1LjM0OCwwLDAsMSwzOS4wODEsNGE1LjU1Miw1LjU1MiwwLDAsMSwzLjc5LDEuNTUzQTQuNjM1LDQuNjM1LDAsMCwxLDQ0LjU1LDkuMzQ1Yy0uMDI4LDEuNjg4LTIuMDIzLDQuMTI1LTIuMjQxLDQuMzc1YTEuNTc2LDEuNTc2LDAsMCwwLS4zLjVoNy4yNjFBMi42NSwyLjY1LDAsMCwxLDUyLDE2Ljg0N3Y0LjEyNnEwLDEuNzgyLTEuNywxLjc4MmExLjc0MywxLjc0MywwLDAsMS0xLjMxOS0uNTQ5QTEzLjE1MiwxMy4xNTIsMCwwLDAsNDYuOTUzLDIwLjU4OFpNMjguMzMsMzkuMDcxYS41ODIuNTgyLDAsMCwwLC42Ni42NTdoNy4xNjdhMS41NzksMS41NzksMCwwLDEsMS43OTIsMS43ODEsMi4yMzgsMi4yMzgsMCwwLDEtLjM4NywxLjI1NGMtLjI4My40MDgtLjU4Mi44MTMtLjksMS4yMTlzLS42MTMuODMtLjksMS4yNjZhMi41NDYsMi41NDYsMCwwLDAtLjQyNCwxLjQwNywzLjExNSwzLjExNSwwLDAsMCwxLjEzMSwyLjUzMiw0LjAyMiw0LjAyMiwwLDAsMCwyLjY0MS45MzgsMy43NzYsMy43NzYsMCwwLDAsMi40NTItLjkzOEEzLjExNSwzLjExNSwwLDAsMCw0Mi43LDQ2LjY1NWEyLjU0NiwyLjU0NiwwLDAsMC0uNDI0LTEuNDA3LDEyLjUxMywxMi41MTMsMCwwLDAtLjk0My0xLjI2NnEtLjUxOS0uNjA5LS45NDMtMS4xNzJhMi4yNjEsMi4yNjEsMCwwLDEtLjQ2Mi0xLjMsMS42MTQsMS42MTQsMCwwLDEsLjU2Ni0xLjMxMywyLjAwNiwyLjAwNiwwLDAsMSwxLjMyLS40NjhoNy40NXEuOTQyLDAsLjk0My0uNjU3VjI2LjUwNmExLjYwOSwxLjYwOSwwLDAsMC0uNzA3LjQyMnEtLjUxOS40MjEtMS4xNzkuODlhMTEuMDY5LDExLjA2OSwwLDAsMS0xLjUwOS44OTEsMy43NywzLjc3LDAsMCwxLTEuNy40MjIsNS40NSw1LjQ1LDAsMCwxLTMuNjc4LTEuNSw0LjI1LDQuMjUsMCwwLDEtMS4yMjYtMS44NzYsNy4wNTMsNy4wNTMsMCwwLDEtLjM3Ny0yLjI1LDUuMTY2LDUuMTY2LDAsMCwxLDEuNi0zLjcsNS4wMDksNS4wMDksMCwwLDEsMy42NzgtMS42NDEsNC44ODQsNC44ODQsMCwwLDEsMi4zNTcuNTE1QTcuNTg3LDcuNTg3LDAsMCwxLDQ5LjUxOCwyMC4yYy41MDYuNTg4Ljc4NS42MjQuNzg1LjYyNFYxNi44NDdhLjU0NC41NDQsMCwwLDAtLjMzMS0uNDY5LDEuNDIyLDEuNDIyLDAsMCwwLS43MDctLjE4N2gtNy40NWEyLjE0NywyLjE0NywwLDAsMS0xLjMyLS40MjIsMS41ODcsMS41ODcsMCwwLDEtLjU2Ni0xLjM2LDIuMDY3LDIuMDY3LDAsMCwxLC40MjUtMS4xNzJxLjQyNS0uNjA5Ljk0My0xLjIxOWExMi4yMjIsMTIuMjIyLDAsMCwwLC45NDMtMS4yNjYsMi41NDEsMi41NDEsMCwwLDAsLjQyNC0xLjQwNywzLjExOCwzLjExOCwwLDAsMC0xLjEzMi0yLjUzMiwzLjc3MSwzLjc3MSwwLDAsMC0yLjQ1MS0uOTM4LDMuODM5LDMuODM5LDAsMCwwLTIuNTk0LjkzOEEzLjE3OCwzLjE3OCwwLDAsMCwzNS40LDkuMzQ1YTIuNzc2LDIuNzc2LDAsMCwwLC40MjQsMS40NTQsMTAuMDM3LDEwLjAzNywwLDAsMCwuOSwxLjI2NWwuODQ5LDEuMjJhMi45MDksMi45MDksMCwwLDEsLjQ3MSwxLjEyNSwxLjYyNSwxLjYyNSwwLDAsMS0uNTE4LDEuMzYsMS45NTYsMS45NTYsMCwwLDEtMS4yNzQuNDIySDI5LjA4NHEtLjc1NSwwLS43NTQuNjU2Wm0yMy42NywwYTIuNywyLjcsMCwwLDEtLjU3NiwyLDIuNjc1LDIuNjc1LDAsMCwxLTIuMTU5LjYyNiIvPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTM3LjE0NywzMS4wNzRhMy4zMjgsMy4zMjgsMCwwLDAtMi44NzgtMS4zNiw0LjQ0NSw0LjQ0NSwwLDAsMC0yLjEyLjQyMiw2LjE4NSw2LjE4NSwwLDAsMC0xLjE3OC44OTFxLS41NjcuNDcxLTEuMTMyLjg5MWMtLjM3My4yNzgtLjgwOC43NzMtMS4zLjc3NkgyNi43MjdWMTYuNDZhMy4zMzUsMy4zMzUsMCwwLDAtLjM3Ny0xLjUsMS40MzYsMS40MzYsMCwwLDAtMS40MTUtLjc1MUgxOS4yNzdjLS41LDAtLjc1NC4yNTEtLjc1NC44NDRhMS45MDcsMS45MDcsMCwwLDAsLjM3NywxLjEyNiw5LjE0Niw5LjE0NiwwLDAsMCwuOTQzLDEuMTI1LDUuMzQxLDUuMzQxLDAsMCwxLC45NDMsMS4yNjYsMy4yMzYsMy4yMzYsMCwwLDEsLjM3NywxLjU0Nyw0LjQ1NCw0LjQ1NCwwLDAsMS0xLjI3MywzLjE0MSw0LjA0OSw0LjA0OSwwLDAsMS0zLjA2NSwxLjM2LDMuOSwzLjksMCwwLDEtMy4wMTgtMS4zNiw0LjU0Nyw0LjU0NywwLDAsMS0xLjIyNS0zLjE0MSwyLjkzNiwyLjkzNiwwLDAsMSwuNDI0LTEuNTQ3LDEzLjU0OCwxMy41NDgsMCwwLDEsLjktMS4zMTNjLjMxNC0uNDA2LjYyNy0uNzgxLjk0My0xLjEyNWExLjU4OCwxLjU4OCwwLDAsMCwuNDcxLTEuMDc5cTAtLjg0My0xLjAzNy0uODQ0SDUuN2ExLjU4NywxLjU4NywwLDAsMC0xLjIyNi41MTZBMS44MDYsMS44MDYsMCwwLDAsNCwxNS45OTFWMzkuOWExLjgsMS44LDAsMCwwLC40NzEsMS4yNjYsMS41ODMsMS41ODMsMCwwLDAsMS4yMjYuNTE2aDguNDg4Yy42OTEsMCwxLjAzNS4yMzgsMS4wMzcuNzVhMS41NDcsMS41NDcsMCwwLDEtLjQyMi45NDRMMTMuODA3LDQ0LjVhNi41NDksNi41NDksMCwwLDAtLjk5LDEuMjY2LDMuMTE2LDMuMTE2LDAsMCwwLS40MjQsMS42NDEsNC4yMzcsNC4yMzcsMCwwLDAsMS4zNjcsMy40Nyw0Ljc5MSw0Ljc5MSwwLDAsMCw2LjIyNC0uMDQ3LDQuNTE3LDQuNTE3LDAsMCwwLDEuNDQ1LTMuMjgzLDMuNjMxLDMuNjMxLDAsMCwwLS41MTQtMS44ODljLS4yMTUtLjMwNy0uOTc4LTEuMTU4LS45NzgtMS4xNThMMTguOSw0My4zNzNhMS40OTIsMS40OTIsMCwwLDEtLjM3Ny0uOTM4cTAtLjc1Ljg0OC0uNzVoNS42NThxMS4yMjYsMCwxLjctMS41VjM1LjM0MUgyOC4zNWMuNTU3LDAsMS4wNTQuNTE5LDEuNDg5LjhhMTIuMjkxLDEyLjI5MSwwLDAsMSwxLjIyNi44OTFxLjU2NS40NjksMS4xNzkuODlhMy43ODYsMy43ODYsMCwwLDAsMS44MTYuNDIyLDMuMjU2LDMuMjU2LDAsMCwwLDMuMDg3LTEuNDA2LDUuMTE5LDUuMTE5LDAsMCwwLC45OS0zQTQuNzg4LDQuNzg4LDAsMCwwLDM3LjE0NywzMS4wNzRaIi8+PC9zdmc+';
  let card = document.createElement('ui5-card');
  let header = document.createElement('ui5-card-header');
  // header.slot = 'header';
  header.setAttribute('title-text', offering.metadata.displayName);
  header.setAttribute('subtitle-text', offering.catalog_name);
  header.setAttribute('status', `${index + 1} of ${total}`);
  const avatar = document.createElement('ui5-avatar');
  avatar.slot = 'avatar';
  const img = document.createElement('img');
  img.src = offering.metadata?.imageUrl || greyImg;
  avatar.appendChild(img);
  header.appendChild(avatar);

  let cardContent = document.createElement('div');
  cardContent.setAttribute('class', 'content-group');
  cardContent.innerHTML = `${offering.description}`;
  card.appendChild(header);
  card.appendChild(cardContent);
  return card;
}
