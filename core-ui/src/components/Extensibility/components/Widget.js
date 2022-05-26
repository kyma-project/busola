import React from 'react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';

import { widgets } from './index';
import { getValue, useGetTranslation } from './helpers';

export const SimpleRenderer = ({ children }) => children;

export function InlineWidget({ children, structure, ...props }) {
  const { t } = useGetTranslation();
  return (
    <LayoutPanelRow name={t(structure.path || structure.id)} value={children} />
  );
}

export function Widget({ structure, value, inlineRenderer, ...props }) {
  const InlineRenderer = inlineRenderer || SimpleRenderer;
  console.log('Widget', { structure, value, props });
  const { Plain, Text } = widgets;

  if (Array.isArray(structure)) {
    return (
      <Plain value={value} structure={{ children: structure }} {...props} />
    );
  }

  const childValue = structure.path ? getValue(value, structure.path) : value;

  let Renderer = structure.children ? Plain : Text;
  if (structure.widget) {
    Renderer = widgets[structure.widget];
    if (!Renderer) {
      return `no widget ${structure.widget}`;
    }
  }

  const SingleWidget = props =>
    Renderer.inline && InlineRenderer ? (
      <InlineRenderer {...props}>
        <Renderer {...props} />
      </InlineRenderer>
    ) : (
      <Renderer {...props} />
    );

  return Array.isArray(childValue) && !Renderer.array ? (
    childValue.map(item => (
      <SingleWidget value={item} structure={structure} {...props} />
    ))
  ) : (
    <SingleWidget value={childValue} structure={structure} {...props} />
  );
}
