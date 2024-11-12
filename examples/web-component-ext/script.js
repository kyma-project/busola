class MyComponent1 extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '';
    // create elements programmatically
    const button = document.createElement('ui5-button');
    button.textContent = 'List namespaces';
    button.design = 'Emphasized';
    this.appendChild(button);
    button.addEventListener('click', async () => {
      const fetchFn = window.kymaFetchFn;
      console.log(window.kymaFetchFn);
      if (!fetchFn) {
        alert('Kyma fetch function is not available');
        return;
      }
      let response = await fetchFn({
        relativeUrl: '/api/v1/namespaces',
        init: {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
      });
      let body = await response.json();
      let namespaces = body.items.map(item => item.metadata.name).join('\n');
      alert('Namespaces:\n' + namespaces);
    });
  }
}
if (!customElements.get('my-component-1')) {
  customElements.define('my-component-1', MyComponent1);
}
