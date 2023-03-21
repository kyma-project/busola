import React from 'react';

import { ExtensibilityErrBoundary } from 'components/Extensibility/ExtensibilityErrBoundary';
import { useGetSchema } from 'hooks/useGetSchema';

import { DataSourcesContextProvider } from './contexts/DataSources';
import { useGetInjections } from './useGetInjection';
import { Widget } from './components/Widget';
import { TranslationBundleContext } from './helpers';
import { useJsonata } from './hooks/useJsonata';
import { usePrepareResourceUrl } from 'resources/helpers';
import pluralize from 'pluralize';
import { useGet } from 'shared/hooks/BackendAPI/useGet';

export const ExtensibilityInjectionCore = ({ resMetaData, root }) => {
  const { resource } = resMetaData?.general ?? {};

  const { schema } = useGetSchema({
    resource,
  });

  let resourceUrl = usePrepareResourceUrl({
    apiGroup: resource?.group,
    apiVersion: resource?.version,
    resourceType: pluralize(resource?.kind).toLowerCase(),
  });

  const { data } = useGet(resourceUrl, { pollingInterval: 0 });

  const jsonata = useJsonata({});

  // there may be a moment when `resMetaData` is undefined (e.g. when switching the namespace)
  if (!resource) {
    return null;
  }
  const dataSources = resMetaData?.dataSources || {};
  const injection = resMetaData?.injection;
  const injectionName = injection?.name;
  const filter = injection?.target.filter || injection?.filter || null;

  const items = data?.items || [];
  const filteredItems = items.filter(item => {
    if (filter) {
      const [value] = jsonata(filter, { item, root });
      return value;
    }
    return true;
  });

  return (
    <Widget
      key={injectionName}
      value={filteredItems}
      structure={injection}
      schema={schema}
      dataSources={dataSources}
      originalResource={filteredItems}
      inlineContext={true}
    />
  );
};

const ExtensibilityInjections = ({ destination, slot, root }) => {
  const injections = useGetInjections(destination, slot);
  let itemList = [];
  injections.forEach(injection => {
    itemList.push(
      <ExtensibilityInjection resMetaData={injection} root={root} />,
    );
  });
  return itemList;
};

const ExtensibilityInjection = ({ resMetaData, root }) => {
  const { urlPath, defaultPlaceholder } = resMetaData?.general || {};
  return (
    <TranslationBundleContext.Provider
      value={{
        translationBundle: urlPath || 'extensibility',
        defaultResourcePlaceholder: defaultPlaceholder,
      }}
    >
      <DataSourcesContextProvider dataSources={resMetaData?.dataSources || {}}>
        <ExtensibilityErrBoundary>
          <ExtensibilityInjectionCore resMetaData={resMetaData} root={root} />
        </ExtensibilityErrBoundary>
      </DataSourcesContextProvider>
    </TranslationBundleContext.Provider>
  );
};

export default ExtensibilityInjections;
