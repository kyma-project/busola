import React from 'react';
import pluralize from 'pluralize';
import { useTranslation } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { usePrepareListProps } from 'resources/helpers';
import { prettifyKind } from 'shared/utils/helpers';
import { ExtensibilityErrBoundary } from 'components/Extensibility/ExtensibilityErrBoundary';
import { useGetSchema } from 'hooks/useGetSchema';

import { useGetCRbyPath } from './useGetCRbyPath';
import { ExtensibilityCreate } from './ExtensibilityCreate';
import {
  useCreateResourceDescription,
  TranslationBundleContext,
  useGetTranslation,
  applyFormula,
  getTextSearchProperties,
} from './helpers';
import { sortBy } from './helpers/sortBy';
import { Widget } from './components/Widget';
import { DataSourcesContextProvider } from './contexts/DataSources';
import { useJsonata } from './hooks/useJsonata';

export const ExtensibilityListCore = ({
  resMetaData,
  filterFunction,
  ...props
}) => {
  const { t, widgetT, exists } = useGetTranslation();
  const { t: tBusola } = useTranslation();
  const jsonata = useJsonata({});

  const { urlPath, resource, description, features } =
    resMetaData?.general ?? {};

  const { disableCreate, disableEdit, disableDelete } = features?.actions
    ? {}
    : {
        disableCreate: props.disableCreate,
        disableEdit: props.disableEdit,
        disableDelete: props.disableDelete,
      };

  const dataSources = resMetaData?.dataSources || {};
  const { schema } = useGetSchema({
    resource,
  });

  const listProps = usePrepareListProps({
    resourceName: urlPath,
    resourceType: resource?.kind,
    resourceI18Key: 'name',
    apiGroup: resource?.group,
    apiVersion: resource?.version,
    hasDetailsView: !!resMetaData?.details,
  });

  const resourceTitle = resMetaData?.general?.name;
  listProps.resourceTitle = exists('name')
    ? t('name')
    : resourceTitle || pluralize(prettifyKind(resource?.kind || ''));

  if (resource?.kind) {
    listProps.resourceUrl = listProps.resourceUrl.replace(
      /[a-z0-9-]+\/?$/,
      pluralize(resource.kind).toLowerCase(),
    );
  }
  listProps.createFormProps = { resourceSchema: resMetaData };

  listProps.description = useCreateResourceDescription(description);

  listProps.customColumns = Array.isArray(resMetaData?.list)
    ? resMetaData?.list.map((column, i) => ({
        header: widgetT(column),
        value: resource => (
          <Widget
            key={i}
            value={resource}
            structure={column}
            schema={schema}
            dataSources={dataSources}
            originalResource={resource}
            inlineContext={true}
          />
        ),
      }))
    : [];

  const isFilterAString = typeof resMetaData?.resource?.filter === 'string';
  const filterFn = value =>
    applyFormula(value, resMetaData.resource.filter, tBusola);
  listProps.filter = isFilterAString ? filterFn : filterFunction;

  const sortOptions = (resMetaData?.list || []).filter(element => element.sort);
  const searchOptions = (resMetaData?.list || []).filter(
    element => element.search,
  );

  const textSearchProperties = getTextSearchProperties({
    searchOptions,
    defaultSearch: true,
  });

  return (
    <ResourcesList
      {...listProps}
      {...props}
      disableCreate={disableCreate}
      disableEdit={disableEdit}
      disableDelete={disableDelete}
      createResourceForm={ExtensibilityCreate}
      sortBy={defaultSortOptions =>
        sortBy(jsonata, sortOptions, t, defaultSortOptions)
      }
      searchSettings={{
        textSearchProperties: defaultSearchProperties =>
          textSearchProperties(defaultSearchProperties),
      }}
    />
  );
};

const ExtensibilityList = ({ overrideResMetadata, ...props }) => {
  const defaultResMetadata = useGetCRbyPath();
  const resMetaData = overrideResMetadata || defaultResMetadata;
  const { urlPath, defaultPlaceholder } = resMetaData?.general ?? {};

  return (
    <TranslationBundleContext.Provider
      value={{
        translationBundle: urlPath,
        defaultResourcePlaceholder: defaultPlaceholder,
      }}
    >
      <DataSourcesContextProvider dataSources={resMetaData?.dataSources || {}}>
        <ExtensibilityErrBoundary key={urlPath}>
          <ExtensibilityListCore resMetaData={resMetaData} {...props} />
        </ExtensibilityErrBoundary>
      </DataSourcesContextProvider>
    </TranslationBundleContext.Provider>
  );
};

export default ExtensibilityList;
