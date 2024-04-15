import { isNil } from 'lodash';
import { useTranslation } from 'react-i18next';

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
  const CopyableWrapper = ({ children }) => {
    const isRendererCopyable =
      typeof Renderer.copyable === 'function'
        ? Renderer.copyable(Renderer)
        : Renderer.copyable;

    const jsonata = useJsonata({
      resource: props.originalResource,
      parent: props.singleRootResource,
      embedResource: props.embedResource,
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
      <CopiableText textToCopy={textToCopy} disabled={!textToCopy}>
        {children}
      </CopiableText>
    );
  };

  return Renderer.inline ? (
    <InlineRenderer {...props}>
      <CopyableWrapper structure={props.structure} value={props.value}>
        <Renderer {...props} />
      </CopyableWrapper>
    </InlineRenderer>
  ) : (
    <Renderer {...props} />
  );
}

export function Widget({
  structure,
  value,
  arrayItems = [],
  inlineRenderer,
  originalResource,
  singleRootResource,
  embedResource,
  index,
  ...props
}) {
  const { Plain, Text } = widgets;
  const { t } = useTranslation();
  const jsonata = useJsonata({
    resource: originalResource,
    parent: singleRootResource,
    embedResource: embedResource,
    scope: value,
    arrayItems,
  });

  const [childValue] = jsonata(structure.source, {
    index: index,
  });
  const [visible, visibilityError] = jsonata(
    structure.visibility?.toString(),
    {
      value: childValue,
    },
    true,
  );

  if (visibilityError) {
    return t('extensibility.configuration-error', {
      error: visibilityError.message,
    });
  }

  if (visible === false) return null;

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
        singleRootResource={singleRootResource}
        embedResource={embedResource}
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
        singleRootResource={valueItem}
        embedResource={embedResource}
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
      singleRootResource={singleRootResource || originalResource}
      embedResource={embedResource}
    />
  );
}
