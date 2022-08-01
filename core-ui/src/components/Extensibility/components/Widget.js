import React, { useEffect } from 'react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { useRelationsContext } from '../contexts/RelationsContext';
import { isNil } from 'lodash';
import { widgets, valuePreprocessors } from './index';
import { useTranslation } from 'react-i18next';

import {
  getValue,
  applyFormula,
  useGetTranslation,
  useGetPlaceholder,
} from '../helpers';
import { stringifyIfBoolean } from 'shared/utils/helpers';
import jsonata from 'jsonata';

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
  const InlineRenderer = inlineRenderer || SimpleRenderer;

  return Renderer.inline && InlineRenderer ? (
    <InlineRenderer {...props}>
      <Renderer {...props} />
    </InlineRenderer>
  ) : (
    <Renderer {...props} />
  );
}

export function shouldBeVisible(value, visibilityFormula) {
  // allow hidden to be set only explicitly
  if (!visibilityFormula) return { visible: visibilityFormula !== false };

  try {
    const expression = jsonata(visibilityFormula);
    return { visible: !!expression.evaluate({ data: value }) };
  } catch (e) {
    console.warn('Widget::shouldBeVisible error:', e);
    return { visible: false, error: e };
  }
}

export function Widget({ structure, value, inlineRenderer, ...props }) {
  const { Plain, Text } = widgets;
  const { t } = useTranslation();
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
    } else {
      childValue = getValue(value, structure.path);
    }
  }

  const { visible, error: visibleCheckError } = shouldBeVisible(
    childValue,
    structure.visibility,
  );

  useEffect(() => {
    if (!visible) return;
    // run `requestRelatedResource` in useEffect, as it might update Context's state
    if (structure.path && !!getRelatedResourceInPath(structure.path)) {
      requestRelatedResource(value, structure.path);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {...props}
      />
    );
  }

  if (structure.formula) {
    childValue = applyFormula(childValue, structure.formula, t);
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

  const sanitizedValue = stringifyIfBoolean(childValue);

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
      value={sanitizedValue}
      structure={structure}
      {...props}
    />
  );
}
