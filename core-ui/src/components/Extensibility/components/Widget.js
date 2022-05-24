import React from 'react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';

import { widgets } from './index';
import { getValue, useGetTranslation } from './helpers';

export function SimpleRenderer({ renderer, ...props }) {
  const Renderer = renderer;
  return <Renderer {...props} />;
}

export function InlineWidget({ renderer, structure, ...props }) {
  const { t } = useGetTranslation();
  const Renderer = renderer;
  return (
    <LayoutPanelRow
      name={t(structure.path || structure.id)}
      value={<Renderer structure={structure} {...props} />}
    />
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

  if (structure.widget) {
    const Renderer = widgets[structure.widget];
    if (!Renderer) {
      return `no widget ${structure.widget}`;
    } else if (Renderer.inline) {
      return (
        <InlineRenderer
          renderer={Renderer}
          value={childValue}
          structure={structure}
          {...props}
        />
      );
    } else {
      return <Renderer value={childValue} structure={structure} {...props} />;
    }
  }

  if (structure.children) {
    return <Plain value={childValue} structure={structure} {...props} />;
  }

  return (
    <InlineRenderer
      renderer={Text}
      value={childValue}
      structure={structure}
      {...props}
    />
  );
}
