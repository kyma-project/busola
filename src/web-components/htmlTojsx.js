import React from 'react';

const customWebComponents = ['monaco-editor', 'dynamic-page-component'];

const isCustomWebComp = (node) =>
  customWebComponents.includes(node.tagName.toLowerCase());

const camelToKebabCase = (str) =>
  str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

// Map event listeners to props
const mapEventListeners = (node, props) => {
  if (typeof node.getEventListeners !== 'function') return props;

  const eventListeners = node.getEventListeners();
  eventListeners.forEach(({ type, listener }) => {
    props[`on${type.charAt(0).toUpperCase() + type.slice(1)}`] = listener;
  });

  return props;
};

// Map attributes to props
const mapAttributes = (node) => {
  const props = {};
  for (let { name, value } of node.attributes) {
    props[name === 'class' ? 'className' : name] = value;
  }
  return props;
};

export function parseHtmlToJsx(element) {
  if (!(element instanceof HTMLElement)) {
    throw new Error('Input must be an HTML element.');
  }

  const parseElement = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (!(node instanceof HTMLElement)) return null;

    const tagName = node.tagName.toLowerCase();
    let props = mapAttributes(node);

    // Add event listeners to props
    props = mapEventListeners(node, props);

    // Because of parsing issues with React.createElement on custom web components we are passing the props as attributes
    if (isCustomWebComp(node)) {
      const parsedPropsNames = Object.entries(node.getProps()).map(
        ([key, value]) => [`prop_${camelToKebabCase(key)}`, value],
      );
      const parsedSlotsNames = Object.entries(node.getSlots()).map(
        ([key, value]) => [`slot_${camelToKebabCase(key)}`, value],
      );

      props = {
        ...props,
        ...Object.fromEntries(parsedPropsNames),
        ...Object.fromEntries(parsedSlotsNames),
      };

      // Update attributes for custom components
      Object.entries(props).forEach(([key, value]) => {
        node.setAttributeNS(null, key, value);
      });

      return <div dangerouslySetInnerHTML={{ __html: node.outerHTML }} />;
    }

    const children = Array.from(node.childNodes)
      .map(parseElement)
      .filter(Boolean);

    return React.createElement(tagName, props, ...children);
  };

  return parseElement(element);
}
