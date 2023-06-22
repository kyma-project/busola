export default class HelloWorldComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `<h1>This is new one</h1>`;
  }
}

// customElements.define("hello-world", HelloWorldComponent)
