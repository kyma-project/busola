import React from 'react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { useTranslation } from 'react-i18next';

import { getValue, ApplyFormula, useGetTranslation } from '../helpers';
import { widgets } from './index';

export const SimpleRenderer = ({ children }) => children;

export function InlineWidget({ children, structure, ...props }) {
  const { widgetT } = useGetTranslation();
  return <LayoutPanelRow name={widgetT(structure)} value={children} />;
}

export function Widget({ structure, value, inlineRenderer, ...props }) {
  const InlineRenderer = inlineRenderer || SimpleRenderer;
  const { Plain, Text } = widgets;
  const { i18n } = useTranslation();

  if (Array.isArray(structure)) {
    return (
      <Plain value={value} structure={{ children: structure }} {...props} />
    );
  }

  let childValue = structure.path ? getValue(value, structure.path) : value;

  if (structure.formula) {
    childValue = ApplyFormula(childValue, structure.formula, i18n);
  }

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
