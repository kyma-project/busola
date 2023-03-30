import React from 'react';
import { isNil } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { stringifyIfBoolean } from 'shared/utils/helpers';
import { showDebugonataState } from 'state/preferences/showDebugonataAtom';
import { CopiableText } from 'shared/components/CopiableText/CopiableText';

import { useGetTranslation, useGetPlaceholder } from '../helpers';
import { useJsonata } from '../hooks/useJsonata';
import { Debugonata, DebugContextProvider } from '../debugger/useDebugger';
import { widgets, valuePreprocessors } from './index';

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

const CopyableWrapper = ({ Renderer, props, children }) => {
  const isRendererCopyable =
    typeof Renderer.copyable === 'function'
      ? Renderer.copyable(Renderer)
      : Renderer.copyable;

  const jsonata = useJsonata({
    resource: props.originalResource,
    scope: props.scope,
    value: props.value,
    arrayItems: props.arrayItems,
  });

  if (!props.structure.copyable || !isRendererCopyable) return children;

  const defaultCopyFunction = ({ value }) =>
    typeof value === 'object' ? JSON.stringify(value) : value;

  const copyFunction =
    typeof Renderer.copyFunction === 'function'
      ? Renderer.copyFunction
      : defaultCopyFunction;

  const textToCopy = copyFunction(
    props,
    Renderer,
    defaultCopyFunction,
    jsonata,
  );
  return (
    <CopiableText compact textToCopy={textToCopy} disabled={!textToCopy}>
      {children}
    </CopiableText>
  );
};

function SingleWidget({ inlineRenderer, Renderer, ...props }) {
  const showDebugonata = useRecoilValue(showDebugonataState);
  const InlineRenderer = inlineRenderer || SimpleRenderer;

  return Renderer.inline ? (
    <InlineRenderer {...props}>
      <CopyableWrapper props={props} Renderer={Renderer}>
        <Renderer {...props} />
        {showDebugonata && <Debugonata />}
      </CopyableWrapper>
    </InlineRenderer>
  ) : (
    <>
      <Renderer {...props} />
      {showDebugonata && <Debugonata />}
    </>
  );
}

export function WidgetCore({
  structure,
  value,
  arrayItems = [],
  inlineRenderer,
  originalResource,
  ...props
}) {
  const { Plain, Text } = widgets;
  const { t } = useTranslation();

  const jsonata = useJsonata({
    resource: originalResource,
    scope: value,
    arrayItems,
  });

  const [childValue] = jsonata(structure.source, { datapoint: 'source' });

  const [visible, visibilityError] = jsonata(
    structure.visibility?.toString(),
    {
      datapoint: 'visibility',
      value: childValue,
    },
    true,
  );

  if (visibilityError) {
    return t('extensibility.configuration-error', {
      error: visibilityError.message,
    });
  }

  if (visible === false) {
    return null;
  }

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
        {...props}
        inlineRenderer={inlineRenderer}
        Renderer={Renderer}
        value={valueItem}
        arrayItems={[...arrayItems, valueItem]}
        structure={structure}
        originalResource={originalResource}
        scope={valueItem}
      />
    ))
  ) : (
    <SingleWidget
      {...props}
      inlineRenderer={inlineRenderer}
      Renderer={Renderer}
      value={sanitizedValue}
      scope={value}
      arrayItems={arrayItems}
      structure={structure}
      originalResource={originalResource}
    />
  );
}

export function Widget(props) {
  return (
    <DebugContextProvider>
      <WidgetCore {...props} />
    </DebugContextProvider>
  );
}
