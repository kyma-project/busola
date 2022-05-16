import React, { useState, useEffect } from 'react';
import { isEmpty } from 'lodash';

import { createOrderedMap } from '@ui-schema/ui-schema/Utils/createMap';
import { UIMetaProvider } from '@ui-schema/ui-schema/UIMeta';
import { UIStoreProvider, createStore } from '@ui-schema/ui-schema';
import { injectPluginStack } from '@ui-schema/ui-schema/applyPluginStack';
import { DetailsContainer } from '../ds/DetailsContainer';

import detailsWidgets from '../ds/widgets-details';

const DetailsStack = injectPluginStack(DetailsContainer);

export const DetailsSchema = ({ resource, schema }) => {
  const store = createStore(createOrderedMap(resource));

  if (isEmpty(schema)) return null;

  const schemaMap = createOrderedMap(schema);

  return (
    <UIMetaProvider widgets={detailsWidgets}>
      <UIStoreProvider store={store}>
        <DetailsStack isRoot schema={schemaMap} />
      </UIStoreProvider>
    </UIMetaProvider>
  );
};
