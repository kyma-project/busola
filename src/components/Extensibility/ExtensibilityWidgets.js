import React from 'react';

import { ExtensibilityErrBoundary } from 'components/Extensibility/ExtensibilityErrBoundary';
import { useGetSchema } from 'hooks/useGetSchema';

import { DataSourcesContextProvider } from './contexts/DataSources';
import { useGetWidget } from './useGetWidget';
import { Widget } from './components/Widget';
import { TranslationBundleContext } from './helpers';
import { useJsonata } from './hooks/useJsonata';

export const ExtensibilityWidgetsCore = ({ resMetaData }) => {
  console.log('ExtensibilityWidgetsCore', resMetaData);
  const { urlPath, resource } = resMetaData?.general ?? {};

  const { schema } = useGetSchema({
    resource,
  });

  const jsonata = useJsonata({});

  // there may be a moment when `resMetaData` is undefined (e.g. when switching the namespace)
  if (!resource) {
    return null;
  }

  const widgetName = resMetaData?.widget?.name;
  const widget = resMetaData?.widget;

  const dataSources = resMetaData?.dataSources || {};

  return (
    <Widget
      key={widgetName}
      value={resource}
      structure={widget}
      schema={schema}
      dataSources={dataSources}
      originalResource={resource}
      inlineContext={true}
    />
  );
};

const ExtensibilityWidgets = ({ destination }) => {
  const resMetaData = useGetWidget(destination);
  console.log('ExtensibilityWidgets resMetaData', resMetaData, destination);
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
          <ExtensibilityWidgetsCore resMetaData={resMetaData} />
        </ExtensibilityErrBoundary>
      </DataSourcesContextProvider>
    </TranslationBundleContext.Provider>
  );
};

export default ExtensibilityWidgets;
