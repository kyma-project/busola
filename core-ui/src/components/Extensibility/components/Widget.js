import React, { useEffect } from 'react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { useRelationsContext } from '../contexts/RelationsContext';

import { getValue, useGetTranslation } from '../helpers';
import { widgets } from './index';

export const SimpleRenderer = ({ children }) => children;

export function InlineWidget({ children, structure, ...props }) {
  const { widgetT } = useGetTranslation();
  return (
    <LayoutPanelRow name={widgetT(structure)} value={children} {...props} />
  );
}

export function Widget({ structure, value, inlineRenderer, ...props }) {
  const InlineRenderer = inlineRenderer || SimpleRenderer;
  const { Plain, Text } = widgets;

  const {
    store,
    relations,
    getRelatedResourceInPath,
    requestRelatedResource,
  } = useRelationsContext();

  let childValue;
  if (!structure.path) {
    childValue = value;
  } else {
    const relatedResourcePath = getRelatedResourceInPath(structure.path);
    if (relatedResourcePath) {
      childValue = store[relatedResourcePath] || { loading: true };
      props.relation = relations[relatedResourcePath];
      props.originalResource = value;
    } else {
      childValue = getValue(value, structure.path);
    }
  }

  useEffect(() => {
    // run `requestRelatedResource` in useEffect, as it might update Context's state
    if (structure.path && !!getRelatedResourceInPath(structure.path)) {
      requestRelatedResource(value, structure.path);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (Array.isArray(structure)) {
    return (
      <Plain value={value} structure={{ children: structure }} {...props} />
    );
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
