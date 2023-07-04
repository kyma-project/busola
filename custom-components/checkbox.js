import { CheckBox } from '@ui5/webcomponents-react';

export default class CheckboxComponent extends HTMLElement {
  constructor() {
    super();
  }

  // connectedCallback() {
  //   const shadow = this.attachShadow({ mode: 'open' });

  //   var span = <CheckBox />;

  //   span.innerHTML = `<h1>This is new one</h1>`;
  //   var button = document.createElement("button");
  //   button.innerHTML = 'Hello';
  //   button.addEventListener('click', (e) => {
  //     console.log("click", e);
  //   });
  //   shadow.appendChild(button);
  //   shadow.appendChild(span);

  // }
  connectedCallback() {
    const mountPoint = document.createElement('span');
    this.attachShadow({ mode: 'open' }).appendChild(mountPoint);

    const name = this.getAttribute('name');
    const url = 'https://www.google.com/search?q=' + encodeURIComponent(name);
    // const root = ReactDOM.createRoot(mountPoint);
    // root.render(<a href={url}>{name}</a>);
  }
}

// customElements.define("hello-world", HelloWorldComponent)
