import pluralize from 'pluralize';
import { useContext, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

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
import { resourcesConditionsAtom } from 'state/resourceConditionsAtom';
import { KymaModuleContext } from 'components/Modules/providers/KymaModuleProvider';

export const ExtensibilityDetailsCore = ({
  resMetaData,
  resourceName,
  layoutCloseCreateUrl,
  namespaceId,
  isModule,
  isEntireListProtected,
  headerActions,
}) => {
  const { t, widgetT, exists } = useGetTranslation();
  const { t: tBusola } = useTranslation();

  const setResourcesConditions = useSetAtom(resourcesConditionsAtom);
  const {
    urlPath,
    resource,
    features,
    description: resourceDescription,
  } = resMetaData?.general ?? {};
  let { disableDelete } = features?.actions || {};
  const { disableEdit } = features?.actions || {};
  if (isModule) disableDelete = true;

  const { schema } = useGetSchema({
    resource,
    additionalId: 'Details',
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

  const newDetailsProps = { ...detailsProps };
  newDetailsProps.resourceTitle = resourceTitle;

  if (resource?.kind) {
    newDetailsProps.resourceUrl = detailsProps.resourceUrl?.replace(
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

  const prepareVisibility = async (def, resource) => {
    setResourcesConditions(resource.status);
    const [visible, error] = await jsonata(def.visibility, { resource }, true);
    return { visible, error };
  };

  const prepareDisableEdit = async (resource) => {
    if (disableEdit && typeof disableEdit === 'string') {
      const [isDisabled] = await jsonata(disableEdit, { resource });
      return typeof isDisabled === 'boolean' ? isDisabled : false;
    }
    return disableEdit;
  };

  return (
    <ResourceDetails
      layoutCloseCreateUrl={layoutCloseCreateUrl}
      disableEdit={prepareDisableEdit}
      disableDelete={disableDelete}
      resourceTitle={resourceTitle}
      headerActions={headerActions}
      windowTitle={isModule ? tBusola('kyma-modules.title') : null}
      customColumns={
        Array.isArray(header)
          ? header.map((def, i) => ({
              header: widgetT(def),
              visibility: (resource) => prepareVisibility(def, resource),
              value: (resource) => (
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
              .filter((def) => def.widget !== 'ConditionList')
              .map((def, i) => ({
                header: widgetT(def),
                fullWidth: def.fullWidth,
                visibility: (resource) => prepareVisibility(def, resource),
                value: (resource) => (
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
              .filter((def) => def.widget === 'ConditionList')
              .map((def, i) => ({
                header: widgetT(def),
                visibility: (resource) => prepareVisibility(def, resource),
                value: (resource) => (
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
          ? (resource) => (
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
      isEntireListProtected={isEntireListProtected}
      {...newDetailsProps}
    />
  );
};

export default function ExtensibilityDetails({
  resourceName,
  resourceType,
  layoutCloseCreateUrl,
  namespaceId,
  isModule = false,
  isEntireListProtected = false,
  setResMetadata,
}) {
  const resMetaData = useGetCRbyPath(resourceType);
  useEffect(() => {
    if (isModule && setResMetadata && resMetaData) {
      setResMetadata({
        group: resMetaData?.general?.resource?.group,
        version: resMetaData?.general?.resource?.version,
        kind: resMetaData?.general?.resource?.kind,
      });
    }
  }, [resMetaData, isModule, setResMetadata]);

  const { urlPath, defaultPlaceholder } = resMetaData?.general || {};

  const { customHeaderActions: headerActions, isCommunityModuleSelected } =
    useContext(KymaModuleContext);

  if (!resMetaData) {
    return (
      <CustomResource
        params={{
          customResourceDefinitionName: resourceType,
          resourceName,
          resourceNamespace: namespaceId,
          layoutCloseCreateUrl,
          layoutNumber: 'midColumn',
          headerActions,
          isModule,
          isEntireListProtected:
            isEntireListProtected && !isCommunityModuleSelected,
          setResMetadata,
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
            isEntireListProtected={
              isEntireListProtected && !isCommunityModuleSelected
            }
            headerActions={headerActions}
          />
        </ExtensibilityErrBoundary>
      </DataSourcesContextProvider>
    </TranslationBundleContext.Provider>
  );
}
