export default class HelloWorldComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const name = this.getAttribute('name') ?? 'John Doe';

    this.innerHTML = `<h1>Hello world to you ${name}!!!</h1>`;
  }
}

// customElements.define("hello-world", HelloWorldComponent)
