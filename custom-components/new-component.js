export default class TestComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });

    var span = document.createElement('span');

    span.innerHTML = `<h1>This is new one</h1>`;
    var button = document.createElement('button');
    button.innerHTML = 'Hello';
    button.addEventListener('click', e => {
      console.log('click', e);
    });
    shadow.appendChild(button);
  }
}
