function fetchWrapper(url, options = {}) {
  if (window.extensionProps?.kymaFetchFn) {
    return window.extensionProps.kymaFetchFn(url, options);
  }
  return fetch(url, options);
}

function proxyFetch(url, options = {}) {
  const baseUrl = window.location.hostname.startsWith('localhost')
    ? 'http://localhost:3001/proxy'
    : '/proxy';
  const encodedUrl = encodeURIComponent(url);
  const proxyUrl = `${baseUrl}?url=${encodedUrl}`;
  return fetch(proxyUrl, options);
}

class MyCustomElement extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });

    // Add basic styling
    const style = document.createElement('style');
    style.textContent = `
      .container {
        padding: 1rem;lu
      }
      .deployments-list {
        margin-top: 1rem;
      }
      .deployment-item {
        padding: 0.5rem;
        margin: 0.5rem 0;
        background: #f5f5f5;
        border-radius: 4px;
      }
      .weather-container {
        margin-top: 2rem;
        padding: 1rem;
        background: #e0f7fa;
        border-radius: 8px;
      }
      .weather-item {
        padding: 0.5rem 0;
        margin: 0.5rem 0;
        font-size: 1rem;
      }
    `;
    shadow.appendChild(style);

    // Create container
    const container = document.createElement('div');
    container.className = 'container';

    // Create namespace dropdown
    const namespaceSelect = document.createElement('ui5-select');
    namespaceSelect.id = 'namespaceSelect';
    container.appendChild(namespaceSelect);

    // Create deployments container
    const deploymentsList = document.createElement('div');
    deploymentsList.className = 'deployments-list';
    container.appendChild(deploymentsList);

    // Create weather container
    const weatherContainer = document.createElement('div');
    weatherContainer.className = 'weather-container';
    weatherContainer.id = 'weatherContainer';
    container.appendChild(weatherContainer);

    shadow.appendChild(container);

    // Load initial data
    this.loadData(namespaceSelect, deploymentsList);

    // Add change listener
    namespaceSelect.addEventListener('change', () => {
      this.updateDeploymentsList(namespaceSelect.value, deploymentsList);
    });

    // Fetch and update weather data
    fetchMunichWeatherData().then(weatherData => {
      this.updateWeatherUI(weatherData, weatherContainer);
    });
  }

  async loadData(namespaceSelect, deploymentsList) {
    try {
      // Get namespaces
      const namespaces = await getNamespaces();

      // Populate namespace dropdown
      namespaces.forEach(namespace => {
        const option = document.createElement('ui5-option');
        option.value = namespace.metadata.name;
        option.innerHTML = namespace.metadata.name;
        namespaceSelect.appendChild(option);
      });

      // Load deployments for first namespace
      if (namespaces.length > 0) {
        this.updateDeploymentsList(
          namespaces[0].metadata.name,
          deploymentsList,
        );
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  async updateDeploymentsList(namespace, deploymentsList) {
    try {
      const deployments = await getDeployments(namespace);

      // Clear current list
      deploymentsList.innerHTML = '';

      // Add deployment to list
      deployments.forEach(deployment => {
        const deploymentItem = document.createElement('div');
        deploymentItem.className = 'deployment-item';
        deploymentItem.innerHTML = `
          <div><strong>Name:</strong> ${deployment.metadata.name}</div>
        `;
        deploymentsList.appendChild(deploymentItem);
      });

      // Show message if no deployments
      if (deployments.length === 0) {
        const messageStrip = document.createElement('ui5-message-strip');
        messageStrip.innerHTML = 'No deployments found in this namespace';

        deploymentsList.innerHTML = messageStrip.outerHTML;
      }
    } catch (error) {
      console.error('Failed to update deployments:', error);
      deploymentsList.innerHTML = '<div>Error loading deployments</div>';
    }
  }

  async updateWeatherUI(weatherData, weatherContainer) {
    const { temperature, condition } = weatherData;
    weatherContainer.innerHTML = `
      <ui5-title level="H4">Current weather in Munich:</ui5-title>
      <div class="weather-item"><strong>Temperature:</strong> ${temperature}°C</div>
      <div class="weather-item"><strong>Condition:</strong> ${condition}</div>
    `;
  }
}

async function getNamespaces() {
  const resp = await fetchWrapper('/api/v1/namespaces');
  const data = await resp.json();
  return data.items;
}

async function getDeployments(namespace) {
  const resp = await fetchWrapper(
    `/apis/apps/v1/namespaces/${namespace}/deployments`,
  );
  const data = await resp.json();
  return data.items;
}

async function fetchMunichWeatherData() {
  const latitude = 48.1351;
  const longitude = 11.582;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

  const response = await proxyFetch(url);
  if (!response.ok) {
    console.error(`Error fetching weather: ${response.status}`);
    return;
  }
  const data = await response.json();

  const currentWeather = data.current_weather;
  const temperature = currentWeather.temperature;
  const weatherCode = currentWeather.weathercode;

  const weatherConditions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };

  const condition =
    weatherConditions[weatherCode] || 'Unknown weather condition';

  return { temperature, condition };
}

if (!customElements.get('my-custom-element')) {
  customElements.define('my-custom-element', MyCustomElement);
}
