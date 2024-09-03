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
  isModule,
  headerActions,
}) => {
  const { t, widgetT, exists } = useGetTranslation();
  const { urlPath, resource, features, description: resourceDescription } =
    resMetaData?.general ?? {};
  let { disableEdit, disableDelete } = features?.actions || {};
  if (isModule) disableDelete = true;

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
    : prettifyKind(resource?.kind || '') || resourceName;

  detailsProps.resourceTitle = resourceTitle;

  if (resource?.kind) {
    detailsProps.resourceUrl = detailsProps.resourceUrl?.replace(
      urlPath,
      pluralize(resource.kind).toLowerCase(),
    );
  }

  const header = resMetaData?.details?.header || [];
  const health = resMetaData?.details?.health || [];
  const statusBody = resMetaData?.details?.status?.body || [];
  const statusHeader = resMetaData?.details?.status?.header || [];
  const body = resMetaData?.details?.body || [];
  const dataSources = resMetaData?.dataSources || {};
  const general = resMetaData?.general || {};

  return (
    <ResourceDetails
      layoutCloseCreateUrl={layoutCloseCreateUrl}
      disableEdit={disableEdit}
      disableDelete={disableDelete}
      resourceTitle={resourceTitle}
      headerActions={headerActions}
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
        Array.isArray(statusBody)
          ? statusBody
              .filter(def => def.widget !== 'ConditionList')
              .map((def, i) => ({
                header: widgetT(def),
                type: def.type,
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
      customConditionsComponents={
        Array.isArray(statusBody)
          ? statusBody
              .filter(def => def.widget === 'ConditionList')
              .map((def, i) => ({
                header: widgetT(def),
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
      statusBadge={
        statusHeader
          ? resource => (
              <Widget
                value={resource}
                structure={statusHeader}
                schema={schema}
                dataSources={dataSources}
                originalResource={resource}
              />
            )
          : null
      }
      customHealthCards={
        Array.isArray(health) && health?.length > 0
          ? [
              (resource, i) => (
                <Widget
                  key={i}
                  value={resource}
                  structure={health}
                  schema={schema}
                  dataSources={dataSources}
                  general={general}
                  originalResource={resource}
                  context={general.urlPath}
                />
              ),
            ]
          : []
      }
      description={description}
      createResourceForm={ExtensibilityCreate}
      resourceSchema={resMetaData}
      isModule={isModule}
      {...detailsProps}
    />
  );
};

const ExtensibilityDetails = ({
  resourceName,
  resourceType,
  layoutCloseCreateUrl,
  namespaceId,
  isModule = false,
  headerActions,
}) => {
  const resMetaData = useGetCRbyPath(resourceType);
  const { urlPath, defaultPlaceholder } = resMetaData?.general || {};

  if (!resMetaData) {
    return (
      <CustomResource
        params={{
          customResourceDefinitionName: resourceType,
          resourceName,
          resourceNamespace: namespaceId,
          layoutCloseCreateUrl,
          layoutNumber: 'MidColumn',
          headerActions,
          isModule,
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
            isModule={isModule}
            headerActions={headerActions}
          />
        </ExtensibilityErrBoundary>
      </DataSourcesContextProvider>
    </TranslationBundleContext.Provider>
  );
};

export default ExtensibilityDetails;
