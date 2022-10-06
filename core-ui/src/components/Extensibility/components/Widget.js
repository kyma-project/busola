import React, { useEffect } from 'react';
import { isNil, last } from 'lodash';
import { useTranslation } from 'react-i18next';
import { jsonataWrapper } from '../helpers/jsonataWrapper';

import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { stringifyIfBoolean } from 'shared/utils/helpers';
import { useGetTranslation, useGetPlaceholder } from '../helpers';
import { useJsonata } from '../hooks/useJsonata';
import { widgets, valuePreprocessors } from './index';

export const SimpleRenderer = ({ children }) => {
  return children;
};

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

function SingleWidget({ inlineRenderer, Renderer, ...props }) {
  console.log('SingleWidget');
  const InlineRenderer = inlineRenderer || SimpleRenderer;

  return Renderer.inline && InlineRenderer ? (
    <InlineRenderer {...props}>
      <Renderer {...props} />
    </InlineRenderer>
  ) : (
    <Renderer {...props} />
  );
}

// export function shouldBeVisible(value, visibilityFormula, originalResource) {
// // allow hidden to be set only explicitly
// if (!visibilityFormula) return { visible: visibilityFormula !== false };

// try {
// const expression = jsonataWrapper(visibilityFormula);
// expression.assign('root', originalResource);
// return { visible: !!expression.evaluate({ data: value }) };
// } catch (e) {
// console.warn('Widget::shouldBeVisible error:', e);
// return { visible: false, error: e };
// }
// }

export function Widget({
  structure,
  value,
  arrayItems = [],
  inlineRenderer,
  originalResource,
  ...props
}) {
  console.log('Widget', structure.name, structure.source, {
    structure,
    arrayItems,
  });
  const { Plain, Text } = widgets;
  const { t } = useTranslation();

  const jsonata = useJsonata({
    resource: originalResource,
    scope: value,
    arrayItems,
  });
  useEffect(() => {
    console.log('jsonata function changed');
  }, [jsonata]);

  const [childValue] = jsonata(structure.source);
  // const [childValue] = useMemo(() => jsonata(structure.source, { value }), [jsonata, structure.source, value]);
  // const [childValue] = useJsonata(structure.source, {
  // resource: originalResource,
  // scope: value,
  // arrayItems,
  // });

  console.log('childValue for visibility', childValue);
  const [visible, visibilityError] = jsonata(structure.visibility, {
    value: childValue,
  });
  // const [visible, visibilityError] = useJsonata(
  // structure.visibility,
  // {
  // resource: originalResource,
  // scope: value,
  // arrayItems,
  // value: childValue,
  // },
  // true,
  // );
  console.log('visible?', visible, visibilityError);

  if (visibilityError) {
    // return visible;
    return t('extensibility.configuration-error', {
      error: visibilityError.message,
    });
  }
  if (!visible) return null;

  console.log('visible!');
  // console.log('visible?', structure.visibility, visible);

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
