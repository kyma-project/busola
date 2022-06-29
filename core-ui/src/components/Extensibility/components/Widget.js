import React, { useEffect } from 'react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { useRelationsContext } from '../contexts/RelationsContext';

import { getValue, useGetTranslation } from '../helpers';
import { widgets, valuePreprocessors } from './index';
import jsonata from 'jsonata';

export const SimpleRenderer = ({ children }) => children;

export function InlineWidget({ children, structure, ...props }) {
  const { widgetT } = useGetTranslation();
  return (
    <LayoutPanelRow name={widgetT(structure)} value={children} {...props} />
  );
}

function SingleWidget({ inlineRenderer, Renderer, ...props }) {
  const InlineRenderer = inlineRenderer || SimpleRenderer;
  return Renderer.inline && InlineRenderer ? (
    <InlineRenderer {...props}>
      <Renderer {...props} />
    </InlineRenderer>
  ) : (
    <Renderer {...props} />
  );
}

export function Widget({ structure, value, inlineRenderer, ...props }) {
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

  if (structure.valuePreprocessor) {
    const Preprocessor = valuePreprocessors[structure.valuePreprocessor];
    const copiedStructure = JSON.parse(JSON.stringify(structure));
    copiedStructure.valuePreprocessor = null;
    return (
      <Preprocessor
        value={childValue}
        structure={copiedStructure}
        inlineRenderer={inlineRenderer}
        {...props}
      />
    );
  }

  if (structure.formula) {
    const expression = jsonata(structure.formula);
    childValue = expression.evaluate(childValue);
  }

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

  return Array.isArray(childValue) && !Renderer.array ? (
    childValue.map(item => (
      <SingleWidget
        inlineRenderer={inlineRenderer}
        Renderer={Renderer}
        value={item}
        structure={structure}
        {...props}
      />
    ))
  ) : (
    <SingleWidget
      inlineRenderer={inlineRenderer}
      Renderer={Renderer}
      value={childValue}
      structure={structure}
      {...props}
    />
  );
}
