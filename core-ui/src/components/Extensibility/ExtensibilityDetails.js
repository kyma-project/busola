import React from 'react';
import pluralize from 'pluralize';

import { usePrepareDetailsProps } from 'resources/helpers';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { prettifyKind } from 'shared/utils/helpers';

import { useGetCRbyPath } from './useGetCRbyPath';
import { shouldBeVisible, Widget } from './components/Widget';
import { useGetTranslation, TranslationBundleContext } from './helpers';
import { ExtensibilityCreate } from './ExtensibilityCreate';
import { DataSourcesContextProvider } from './contexts/DataSources';
import { ExtensibilityErrBoundary } from 'components/Extensibility/ExtensibilityErrBoundary';

export const ExtensibilityDetailsCore = ({ resMetaData }) => {
  const { t, widgetT } = useGetTranslation();
  const { path, kind } = resMetaData?.resource ?? {};

  const detailsProps = usePrepareDetailsProps(path, 'name');

  if (resMetaData?.resource?.kind) {
    detailsProps.resourceUrl = detailsProps.resourceUrl.replace(
      path,
      pluralize(kind).toLowerCase(),
    );
  }

  const header = resMetaData?.details?.header || [];
  const body = resMetaData?.details?.body || [];
  const schema = resMetaData?.schema;
  const dataSources = resMetaData?.dataSources || {};

  const breadcrumbs = [
    {
      name: t('name', {
        defaultValue: pluralize(prettifyKind(kind)),
      }),
      path: '/',
      fromContext: resMetaData?.resource?.path,
    },
    { name: '' },
  ];
  return (
    <ResourceDetails
      windowTitle={t('name', {
        defaultValue: pluralize(prettifyKind(kind)),
      })}
      customColumns={
        Array.isArray(header)
          ? header.map((def, i) => ({
              header: widgetT(def),
              visibility: resource => shouldBeVisible(resource, def.visibility),
              value: resource => (
                <Widget
                  key={i}
                  value={resource}
                  structure={def}
                  schema={schema}
                  dataSources={dataSources}
                  originalResource={resource}
                />
              ),
            }))
          : []
      }
      customComponents={
        Array.isArray(body)
          ? [
              (resource, i) => (
                <Widget
                  key={i}
                  value={resource}
                  structure={body}
                  schema={schema}
                  dataSources={dataSources}
                  originalResource={resource}
                />
              ),
            ]
          : []
      }
      breadcrumbs={breadcrumbs}
      createResourceForm={ExtensibilityCreate}
      resourceSchema={resMetaData}
      {...detailsProps}
    />
  );
};

const ExtensibilityDetails = () => {
  const resMetaData = useGetCRbyPath();

  return (
    <TranslationBundleContext.Provider
      value={{
        translationBundle: resMetaData?.resource?.path || 'extensibility',
        defaultResourcePlaceholder: resMetaData?.resource?.defaultPlaceholder,
      }}
    >
      <DataSourcesContextProvider dataSources={resMetaData?.dataSources || {}}>
        <ExtensibilityErrBoundary>
          <ExtensibilityDetailsCore resMetaData={resMetaData} />
        </ExtensibilityErrBoundary>
      </DataSourcesContextProvider>
    </TranslationBundleContext.Provider>
  );
};

export default ExtensibilityDetails;
