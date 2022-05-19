import React from 'react';
import { isEmpty } from 'lodash';

import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';
import { UIMetaProvider } from '@ui-schema/ui-schema/UIMeta';
import { UIStoreProvider, createStore } from '@ui-schema/ui-schema';
import { injectPluginStack } from '@ui-schema/ui-schema/applyPluginStack';
import { DetailsContainer } from '../ds/DetailsContainer';
import { useTranslation } from 'react-i18next';

import detailsWidgets from '../ds/widgets-details';

const DetailsStack = injectPluginStack(DetailsContainer);

export const DetailsSchema = ({ resource, schema, path }) => {
  const store = createStore(createOrderedMap(resource));

  const translationBundle = path || 'extensibility';
  const { t } = useTranslation([translationBundle]); //doesn't always work, add `translationBundle.` at the beggining of a path

  if (isEmpty(schema)) return null;

  const schemaMap = createOrderedMap(schema);

  return (
    <UIMetaProvider
      widgets={detailsWidgets}
      t={(path, ...props) => t(`${translationBundle}:${path}`, ...props)}
    >
      <UIStoreProvider store={store}>
        <DetailsStack isRoot schema={schemaMap} />
      </UIStoreProvider>
    </UIMetaProvider>
  );
};
