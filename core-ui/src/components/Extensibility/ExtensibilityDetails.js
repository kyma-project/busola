import React from 'react';
import pluralize from 'pluralize';

import { usePrepareDetailsProps } from 'resources/helpers';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { prettifyKind } from 'shared/utils/helpers';

import { useGetCRbyPath } from './useGetCRbyPath';
import { shouldBeVisible, Widget } from './components/Widget';
import { useGetTranslation, TranslationBundleContext } from './helpers';
import { ExtensibilityCreate } from './ExtensibilityCreate';
import { ExtensibilityErrBoundary } from 'components/Extensibility/ExtensibilityErrBoundary';
import { DataSourcesContextProvider } from './contexts/DataSources';
import { useGetSchema } from 'hooks/useGetSchema';

export const ExtensibilityDetailsCore = ({ resMetaData }) => {
  // const { extensibilitySchemas } = useMicrofrontendContext();
  const { t, widgetT, exists } = useGetTranslation();
  const { urlPath, resource } = resMetaData?.general ?? {};
  const { schema } = useGetSchema({
    resource,
  });

  const detailsProps = usePrepareDetailsProps(urlPath, 'name');

  /* TODO re-enable validation
  const ajv = new Ajv();
  if (!ajv.validate(extensibilitySchemas?.details, resMetaData?.details)) {
    throwConfigError(t('extensibility.configuration-error'), { error: ajv.errors });
  }
  */

  const resourceName = resMetaData?.general?.name;
  const resourceTitle = exists('name')
    ? t('name')
    : resourceName || prettifyKind(resource.kind);

  detailsProps.resourceTitle = resourceTitle;

  if (resource.kind) {
    detailsProps.resourceUrl = detailsProps.resourceUrl.replace(
      urlPath,
      pluralize(resource.kind).toLowerCase(),
    );
  }

  const header = resMetaData?.details?.header || [];
  const body = resMetaData?.details?.body || [];
  const dataSources = resMetaData?.dataSources || {};

  const breadcrumbs = [
    {
      name: resourceTitle,
      path: '/',
      fromContext: urlPath,
    },
    { name: '' },
  ];
  return (
    <ResourceDetails
      resourceTitle={resourceTitle}
      customColumns={
        Array.isArray(header)
          ? header.map((def, i) => ({
              header: widgetT(def),
              visibility: resource =>
                shouldBeVisible(resource, def.visibility, resource),
              value: resource => (
                <Widget
                  key={i}
                  value={resource}
                  structure={def}
                  schema={schema}
                  dataSources={dataSources}
                  originalResource={resource}
                  inlineContext={true}
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
          <ExtensibilityDetailsCore resMetaData={resMetaData} />
        </ExtensibilityErrBoundary>
      </DataSourcesContextProvider>
    </TranslationBundleContext.Provider>
  );
};

export default ExtensibilityDetails;
