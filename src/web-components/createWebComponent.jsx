import { createRoot } from 'react-dom/client';
import { parseHtmlToJsx } from './htmlTojsx';

function kebabToCamelCase(str) {
  return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function createWebComponent(
  tagName,
  ReactComponent,
  defaultProps = {},
  observedAttributes = [],
  styles = '',
) {
  class GenericWebComponent extends HTMLElement {
    constructor() {
      super();
      this.reactRoot = null;
      this.reactRootInstance = null;
      this._props = {};
      this._slots = {};
    }

    connectedCallback() {
      if (!this.reactRoot) {
        this.reactRoot = document.createElement('div');
        this.reactRoot.setAttribute('id', 'component-root');
        this.appendChild(this.reactRoot);
        this.reactRootInstance = createRoot(this.reactRoot); // Initialize root
      }

      this.applyStyles();
      this.mountReactComponent();
    }

    disconnectedCallback() {
      // Delay unmounting to avoid conflicts with React rendering
      if (this.reactRootInstance) {
        setTimeout(() => {
          if (this.reactRootInstance) {
            this.reactRootInstance.unmount();
            this.reactRootInstance = null; // Clean up instance
          }
        }, 0);
      }
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
      const camelCaseKey = kebabToCamelCase(key);
      this._props[camelCaseKey] = value;
    }

    getProps() {
      return { ...this._props };
    }

    // Define a method to programmatically set a slot's content
    setSlot(name, content) {
      const camelCaseName = kebabToCamelCase(name);
      this._slots[camelCaseName] = content;
      this.mountReactComponent();
    }

    getSlots() {
      return { ...this._slots };
    }

    applyStyles() {
      if (!styles) return;

      // Ensure styles are only applied once per component instance
      const existingStyleElement = this.querySelector(
        'style[data-web-component-style]',
      );
      if (existingStyleElement) return;

      const styleElement = document.createElement('style');
      styleElement.setAttribute('data-web-component-style', 'true');
      styleElement.textContent = styles;
      this.appendChild(styleElement);
    }

    mountReactComponent() {
      // Generate props from attributes
      const propsFromAttributes = observedAttributes.reduce((acc, attr) => {
        const attrValue = this.getAttribute(attr);
        const camelCaseAttr = kebabToCamelCase(attr);
        acc[camelCaseAttr] =
          attrValue !== null ? attrValue : defaultProps[attr];
        return acc;
      }, {});

      const props = {
        ...defaultProps,
        ...propsFromAttributes,
        ...this._props,
      };

      // Check for props and slots in attributes
      for (let i = 0; i < this.attributes.length; i++) {
        const attribute = this.attributes[i];

        if (attribute.name.includes('prop_')) {
          props[kebabToCamelCase(attribute.name.replace('prop_', ''))] = eval(
            this.attributes[i].value,
          );
          this.removeAttribute(attribute.value);
        }

        if (attribute.name.includes('slot_')) {
          props[
            kebabToCamelCase(attribute.name.replace('slot_', ''))
          ] = this.attributes[i].value;
          this.removeAttribute(attribute.value);
        }
      }

      // Set slots
      Object.keys(this._slots).forEach(slotName => {
        if (typeof this._slots[slotName] !== 'function') {
          props[slotName] = parseHtmlToJsx(this._slots[slotName]);
        }
      });

      if (this.reactRootInstance) {
        this.reactRootInstance.render(<ReactComponent {...props} />);
      }
    }
  }

  if (!customElements.get(tagName)) {
    customElements.define(tagName, GenericWebComponent);
  }
}

export default createWebComponent;
