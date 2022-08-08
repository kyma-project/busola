import React, { useState, useEffect } from 'react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { useDataSourcesContext } from '../contexts/DataSources';
import { isNil } from 'lodash';
import { widgets, valuePreprocessors } from './index';
import { useTranslation } from 'react-i18next';

import {
  useGetTranslation,
  useGetPlaceholder,
  throwConfigError,
} from '../helpers';
import { stringifyIfBoolean } from 'shared/utils/helpers';
import jsonata from 'jsonata';

export function useJsonata(query, root, extras = {}) {
  const [value, setValue] = useState('');
  const { t } = useTranslation();
  const {
    store: dataSourceStore,
    requestRelatedResource,
  } = useDataSourcesContext();

  useEffect(() => {
    const dataSourceFetchers = {
      secretRecipe: () => {
        requestRelatedResource(root, 'secretRecipe');
        return dataSourceStore['secretRecipe'].data;
      },
    };

    // console.log('jsonata', query, root);
    if (!query) return '';
    try {
      jsonata(query).evaluate(
        root,
        {
          ...dataSourceFetchers,
          ...extras,
        },
        (error, result) => {
          setValue(result);
        },
      );
      // return expression.evaluate({ data: value, ...additionalSources });
    } catch (e) {
      setValue(t('extensibility.configuration-error', { error: e.message }));
    }
    // }, [query, root, extras, dataSources]); // eslint-disable-line react-hooks/exhaustive-deps
  }, [dataSourceStore]); // eslint-disable-line react-hooks/exhaustive-deps
  return value;
}

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

export function Widget({
  structure,
  value,
  inlineRenderer,
  originalResource,
  ...props
}) {
  const { Plain, Text } = widgets;
  const { t } = useTranslation();
  // const {
  // store,
  // dataSources,
  // getRelatedResourceInPath,
  // requestRelatedResource,
  // } = useDataSourcesContext();

  // let childValue;

  /*
  if (!structure || typeof structure !== 'object') {
    throwConfigError(t('extensibility.not-an-object'), structure);
  }
  if (
    typeof structure.path !== 'string' &&
    !Array.isArray(structure.children) &&
    !Array.isArray(structure)
  ) {
    throwConfigError(t('extensibility.no-path-children'), structure);
  }
  */

  // console.log('Widget', { structure, value, props });
  const childValue = useJsonata(structure.source, originalResource, {
    parent: value,
    item: value,
  });
  /*
  if (!structure.path) {
    childValue = value;
  } else {
    const relatedResourcePath = getRelatedResourceInPath(structure.path);
    if (relatedResourcePath) {
      childValue = store[relatedResourcePath] || { loading: true };
      props.dataSource = dataSources[relatedResourcePath];
    } else {
      childValue = getValue(value, structure.path);
    }
  }
  */

  const { visible, error: visibleCheckError } = shouldBeVisible(
    childValue,
    structure.visibility,
  );

  // useEffect(() => {
  // if (!visible) return;
  // // run `requestRelatedResource` in useEffect, as it might update Context's state
  // if (structure.path && !!getRelatedResourceInPath(structure.path)) {
  // requestRelatedResource(originalResource, );
  // }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

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

  // if (structure.formula) {
  // childValue = applyFormula(childValue, structure.formula, t);
  // }

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
    childValue.map(item => (
      <SingleWidget
        inlineRenderer={inlineRenderer}
        Renderer={Renderer}
        value={item}
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
      structure={structure}
      originalResource={originalResource}
      {...props}
    />
  );
}
