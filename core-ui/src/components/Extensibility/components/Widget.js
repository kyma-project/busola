import React from 'react';
import { isNil } from 'lodash';
import { useTranslation } from 'react-i18next';
import { jsonataWrapper } from '../helpers/jsonataWrapper';

import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { stringifyIfBoolean } from 'shared/utils/helpers';
import { useGetTranslation, useGetPlaceholder } from '../helpers';
import { useJsonata } from '../hooks/useJsonata';
import { widgets, valuePreprocessors } from './index';
import { CopiableText } from 'shared/components/CopiableText/CopiableText';

export const SimpleRenderer = ({ children }) => {
  return children;
};
SimpleRenderer.copyable = true;

export function InlineWidget({ children, value, structure, ...props }) {
  const { widgetT } = useGetTranslation();
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);

  let displayValue;
  if (!isNil(children)) {
    displayValue = children;
  } else if (!isNil(value)) {
    displayValue = value;
  } else {
    displayValue = emptyLeafPlaceholder;
  }

  return (
    <LayoutPanelRow name={widgetT(structure)} value={displayValue} {...props} />
  );
}
InlineWidget.copyable = Renderer => Renderer?.copyable;
InlineWidget.copyFunction = (props, Renderer, defaultCopyFunction) =>
  Renderer?.copyFunction
    ? Renderer.copyFunction(props, Renderer, defaultCopyFunction)
    : defaultCopyFunction(props, Renderer, defaultCopyFunction);

function SingleWidget({ inlineRenderer, Renderer, ...props }) {
  const InlineRenderer = inlineRenderer || SimpleRenderer;

  const CopiableWrapper = ({ children }) => {
    const isRendererCopiable =
      typeof Renderer.copyable === 'function'
        ? Renderer.copyable(Renderer)
        : Renderer.copyable;

    if (!props.structure.copyable || !isRendererCopiable) return children;

    const defaultCopyFunction = ({ value }) =>
      typeof value === 'object' ? JSON.stringify(value) : value;

    const copyFunction =
      typeof Renderer.copyFunction === 'function'
        ? Renderer.copyFunction
        : defaultCopyFunction;

    return (
      <CopiableText
        compact
        textToCopy={copyFunction(props, Renderer, defaultCopyFunction)}
      >
        {children}
      </CopiableText>
    );
  };

  return Renderer.inline ? (
    <InlineRenderer {...props}>
      <CopiableWrapper structure={props.structure} value={props.value}>
        <Renderer {...props} />
      </CopiableWrapper>
    </InlineRenderer>
  ) : (
    <Renderer {...props} />
  );
}

export function shouldBeVisible(value, visibilityFormula, originalResource) {
  // allow hidden to be set only explicitly
  if (!visibilityFormula) return { visible: visibilityFormula !== false };

  try {
    const expression = jsonataWrapper(visibilityFormula);
    expression.assign('root', originalResource);
    return { visible: !!expression.evaluate({ data: value }) };
  } catch (e) {
    console.warn('Widget::shouldBeVisible error:', e);
    return { visible: false, error: e };
  }
}

export function Widget({
  structure,
  value,
  arrayItem,
  inlineRenderer,
  originalResource,
  ...props
}) {
  const { Plain, Text } = widgets;
  const { t } = useTranslation();

  const childValue = useJsonata(structure.source, originalResource, {
    parent: value,
    item: arrayItem || originalResource,
  });

  const { visible, error: visibleCheckError } = shouldBeVisible(
    childValue,
    structure.visibility,
    originalResource,
  );

  if (visibleCheckError) {
    return t('extensibility.configuration-error', {
      error: visibleCheckError.message,
    });
  }
  if (!visible) return null;

  if (structure.valuePreprocessor) {
    const Preprocessor = valuePreprocessors[structure.valuePreprocessor];
    const copiedStructure = JSON.parse(JSON.stringify(structure));
    copiedStructure.valuePreprocessor = null;
    return (
      <Preprocessor
        value={childValue}
        structure={copiedStructure}
        inlineRenderer={inlineRenderer}
        originalResource={originalResource}
        {...props}
      />
    );
  }

  if (Array.isArray(structure)) {
    return (
      <Plain
        value={value}
        structure={{ children: structure }}
        originalResource={originalResource}
        {...props}
      />
    );
  }
  let Renderer = structure.children ? Plain : Text;
  if (structure.widget) {
    Renderer = widgets[structure.widget];
    if (!Renderer) {
      return `no widget ${structure.widget}`;
    }
  }

  const sanitizedValue = stringifyIfBoolean(childValue);

  return Array.isArray(childValue) && !Renderer.array ? (
    childValue.map(valueItem => (
      <SingleWidget
        inlineRenderer={inlineRenderer}
        Renderer={Renderer}
        value={valueItem}
        arrayItem={value}
        structure={structure}
        originalResource={originalResource}
        {...props}
      />
    ))
  ) : (
    <SingleWidget
      inlineRenderer={inlineRenderer}
      Renderer={Renderer}
      value={sanitizedValue}
      arrayItem={arrayItem}
      structure={structure}
      originalResource={originalResource}
      {...props}
    />
  );
}
