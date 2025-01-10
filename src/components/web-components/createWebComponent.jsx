import ReactDOM from 'react-dom';

function kebabToCamelCase(str) {
  return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function createWebComponent(
  tagName,
  ReactComponent,
  defaultProps = {},
  observedAttributes = [],
) {
  class GenericWebComponent extends HTMLElement {
    constructor() {
      super();
      this.reactRoot = null;
      this._props = {};
    }

    connectedCallback() {
      this.reactRoot = document.createElement('div');
      this.appendChild(this.reactRoot);
      this.mountReactComponent();
    }

    disconnectedCallback() {
      ReactDOM.unmountComponentAtNode(this.reactRoot);
    }

    static get observedAttributes() {
      return observedAttributes;
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue !== newValue && this.reactRoot) {
        this.mountReactComponent();
      }
    }

    // Define a generic property setter for custom props
    setProp(key, value) {
      console.log(key);
      const camelCaseKey = kebabToCamelCase(key);
      this._props[camelCaseKey] = value;
      this.mountReactComponent(); // Re-render on prop change
    }

    mountReactComponent() {
      if (!this.reactRoot) {
        this.reactRoot = document.createElement('div');
        this.appendChild(this.reactRoot);
      }

      // Generate props from attributes
      const propsFromAttributes = observedAttributes.reduce((acc, attr) => {
        const attrValue = this.getAttribute(attr);
        const camelCaseAttr = kebabToCamelCase(attr);
        acc[camelCaseAttr] =
          attrValue !== null ? attrValue : defaultProps[attr];
        return acc;
      }, {});

      // Combine props from attributes and custom properties
      const props = {
        ...defaultProps,
        ...propsFromAttributes,
        ...this._props,
      };
      console.log(this._props);
      // Map slots to props
      const slots = this.querySelectorAll('[slot]');
      slots.forEach(slot => {
        const slotName = slot.getAttribute('slot');
        const slotContent = slot.cloneNode(true);
        slot.remove(); // Remove the slot from the DOM
        props[slotName] = (
          <div dangerouslySetInnerHTML={{ __html: slotContent.outerHTML }} />
        );
      });

      ReactDOM.render(
        <ReactComponent {...defaultProps} {...props} />,
        this.reactRoot,
      );
    }
  }

  customElements.define(tagName, GenericWebComponent);
}

export default createWebComponent;
