class MyComponent1 extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '';
    // create elements programmatically
    const button = document.createElement('ui5-button');
    button.textContent = 'Show alert';
    button.design = 'Emphasized';
    this.appendChild(button);
    button.addEventListener('click', () => {
      alert('This is message from MyComponent1');
    });
  }
}
if (!customElements.get('my-component-1')) {
  customElements.define('my-component-1', MyComponent1);
}
