import React from 'react';

import { ExtensibilityErrBoundary } from 'components/Extensibility/ExtensibilityErrBoundary';
import { useGetSchema } from 'hooks/useGetSchema';

import { DataSourcesContextProvider } from './contexts/DataSources';
import { useGetWidgets } from './useGetWidget';
import { Widget } from './components-widget/Widget';
import { TranslationBundleContext } from './helpers';
import { useJsonata } from './hooks/useJsonata';
import { usePrepareResourceUrl } from 'resources/helpers';
import pluralize from 'pluralize';
import { useGet } from 'shared/hooks/BackendAPI/useGet';

export const ExtensibilityWidgetsCore = ({ resMetaData, root }) => {
  const { urlPath, resource } = resMetaData?.general ?? {};

  const { schema } = useGetSchema({
    resource,
  });

  let resourceUrl = usePrepareResourceUrl({
    apiGroup: resource?.group,
    apiVersion: resource?.version,
    resourceType: pluralize(resource?.kind).toLowerCase(),
  });
  let resourceUrl2;
  if (resource?.kind) {
    resourceUrl2 = resourceUrl.replace(
      urlPath,
      pluralize(resource.kind).toLowerCase(),
    );
  }
  const { data } = useGet(resourceUrl, { pollingInterval: 0 });

  const jsonata = useJsonata({});

  // there may be a moment when `resMetaData` is undefined (e.g. when switching the namespace)
  if (!resource) {
    return null;
  }
  const dataSources = resMetaData?.dataSources || {};
  const widget = resMetaData?.widget;
  const widgetName = widget?.name;
  const filter = widget?.filter;

  const items = data?.items || [];
  const filteredItems = items.filter(item => {
    if (filter) {
      const [value] = jsonata(filter, { item, root });
      console.log('lololo value of filter', value);
      return value;
    }
    return true;
  });
  console.log('filter', filter, 'filteredItems', filteredItems);

  return (
    <Widget
      key={widgetName}
      value={filteredItems}
      structure={widget}
      schema={schema}
      dataSources={dataSources}
      originalResource={filteredItems}
      inlineContext={true}
    />
  );
};

const ExtensibilityWidgets = ({ destination, slot, root }) => {
  const widgets = useGetWidgets(destination, slot);
  console.log('ExtensibilityWidgets resMetaData', widgets, destination);
  let itemList = [];
  widgets.forEach(widget => {
    itemList.push(<ExtensibilityWidget resMetaData={widget} root={root} />);
  });
  return itemList;
};

const ExtensibilityWidget = ({ resMetaData, root }) => {
  console.log('!ExtensibilityWidget resMetaData', resMetaData);
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
          <ExtensibilityWidgetsCore resMetaData={resMetaData} root={root} />
        </ExtensibilityErrBoundary>
      </DataSourcesContextProvider>
    </TranslationBundleContext.Provider>
  );
};

export default ExtensibilityWidgets;