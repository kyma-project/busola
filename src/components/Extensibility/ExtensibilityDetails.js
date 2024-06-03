import pluralize from 'pluralize';

import { usePrepareDetailsProps } from 'resources/helpers';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { prettifyKind } from 'shared/utils/helpers';
import { ExtensibilityErrBoundary } from 'components/Extensibility/ExtensibilityErrBoundary';
import { useGetSchema } from 'hooks/useGetSchema';
import { getExtensibilityPath } from 'components/Extensibility/helpers/getExtensibilityPath';

import { DataSourcesContextProvider } from './contexts/DataSources';
import { useGetCRbyPath } from './useGetCRbyPath';
import { Widget } from './components/Widget';
import ExtensibilityCreate from './ExtensibilityCreate';
import {
  TranslationBundleContext,
  useCreateResourceDescription,
  useGetTranslation,
} from './helpers';
import { useJsonata } from './hooks/useJsonata';
import CustomResource from 'resources/CustomResourceDefinitions/CustomResources.details';

export const ExtensibilityDetailsCore = ({
  resMetaData,
  resourceName,
  layoutCloseCreateUrl,
  namespaceId,
}) => {
  const { t, widgetT, exists } = useGetTranslation();

  const { urlPath, resource, features, description: resourceDescription } =
    resMetaData?.general ?? {};
  const { disableEdit, disableDelete } = features?.actions || {};

  const { schema } = useGetSchema({
    resource,
  });

  const jsonata = useJsonata({});

  const description = useCreateResourceDescription(resourceDescription);

  const detailsProps = usePrepareDetailsProps({
    resourceCustomType: getExtensibilityPath(resMetaData?.general),
    resourceType: pluralize(resource?.kind),
    resourceI18Key: 'name',
    apiGroup: resource?.group,
    apiVersion: resource?.version,
    resourceName,
    namespaceId: namespaceId,
  });

  // there may be a moment when `resMetaData` is undefined (e.g. when switching the namespace)
  if (!resource) {
    return null;
  }

  const resourceTitle = exists('name')
    ? t('name')
    : resourceName || prettifyKind(resource?.kind || '');

  detailsProps.resourceTitle = resourceTitle;

  if (resource?.kind) {
    detailsProps.resourceUrl = detailsProps.resourceUrl?.replace(
      urlPath,
      pluralize(resource.kind).toLowerCase(),
    );
  }

  const header = resMetaData?.details?.header || [];
  const status = resMetaData?.details?.status || [];
  const body = resMetaData?.details?.body || [];
  const dataSources = resMetaData?.dataSources || {};

  return (
    <ResourceDetails
      layoutCloseCreateUrl={layoutCloseCreateUrl}
      disableEdit={disableEdit}
      disableDelete={disableDelete}
      resourceTitle={resourceTitle}
      customColumns={
        Array.isArray(header)
          ? header.map((def, i) => ({
              header: widgetT(def),
              visibility: resource => {
                const [visible, error] = jsonata(
                  def.visibility,
                  { resource },
                  true,
                );
                return { visible, error };
              },
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
      customStatusColumns={
        Array.isArray(status)
          ? status.map((def, i) => ({
              header: widgetT(def),
              conditionComponent: def.widget === 'ConditionList',
              value: resource => (
                <Widget
                  key={i}
                  structure={def}
                  value={resource}
                  schema={schema}
                  dataSources={dataSources}
                  originalResource={resource}
                />
              ),
            }))
          : []
      }
      description={description}
      createResourceForm={ExtensibilityCreate}
      resourceSchema={resMetaData}
      {...detailsProps}
    />
  );
};
const ExtensibilityDetails = ({
  resourceName,
  resourceType,
  layoutCloseCreateUrl,
  namespaceId,
}) => {
  const resMetaData = useGetCRbyPath(resourceType);
  const { urlPath, defaultPlaceholder } = resMetaData?.general || {};

  if (!resMetaData) {
    return (
      <CustomResource
        params={{
          customResourceDefinitionName: resourceType,
          resourceName: resourceName,
          resourceNamespace: namespaceId,
          layoutCloseCreateUrl: layoutCloseCreateUrl,
          layoutNumber: 'MidColumn',
        }}
      />
    );
  }

  return (
    <TranslationBundleContext.Provider
      value={{
        translationBundle: urlPath || 'extensibility',
        defaultResourcePlaceholder: defaultPlaceholder,
      }}
    >
      <DataSourcesContextProvider dataSources={resMetaData?.dataSources || {}}>
        <ExtensibilityErrBoundary>
          <ExtensibilityDetailsCore
            resMetaData={resMetaData}
            resourceName={resourceName}
            layoutCloseCreateUrl={layoutCloseCreateUrl}
            namespaceId={namespaceId}
          />
        </ExtensibilityErrBoundary>
      </DataSourcesContextProvider>
    </TranslationBundleContext.Provider>
  );
};

export default ExtensibilityDetails;
