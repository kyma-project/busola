import React from 'react';
import pluralize from 'pluralize';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { usePrepareListProps } from 'resources/helpers';
import { prettifyKind } from 'shared/utils/helpers';

import { useGetCRbyPath } from './useGetCRbyPath';
import { ExtensibilityCreate } from './ExtensibilityCreate';
import {
  useCreateResourceDescription,
  TranslationBundleContext,
  useGetTranslation,
  applyFormula,
  sortBy,
  getTextSearchProperties,
} from './helpers';
import { Widget } from './components/Widget';
import { DataSourcesContextProvider } from './contexts/DataSources';
import { ExtensibilityErrBoundary } from 'components/Extensibility/ExtensibilityErrBoundary';
import { useGetSchema } from 'hooks/useGetSchema';
import { useTranslation } from 'react-i18next';

export const ExtensibilityListCore = ({ resMetaData }) => {
  const { t, widgetT, exists } = useGetTranslation();
  const { t: tBusola } = useTranslation();

  const { urlPath, resource, description, features } =
    resMetaData?.general ?? {};
  const { disableCreate, disableEdit, disableDelete } = features?.actions ?? {};

  const dataSources = resMetaData?.dataSources || {};
  const { schema } = useGetSchema({
    resource,
  });

  const listProps = usePrepareListProps(urlPath, 'name');

  const resourceTitle = resMetaData?.general?.name;
  listProps.resourceTitle = exists('name')
    ? t('name')
    : resourceTitle || pluralize(prettifyKind(resource.kind || ''));

  if (resource.kind) {
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

  const isFilterAString = typeof resMetaData.resource?.filter === 'string';
  const filterFn = value =>
    applyFormula(value, resMetaData.resource.filter, tBusola);
  listProps.filter = isFilterAString ? filterFn : undefined;

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
      disableCreate={disableCreate}
      disableEdit={disableEdit}
      disableDelete={disableDelete}
      createResourceForm={ExtensibilityCreate}
      sortBy={defaultSortOptions => sortBy(sortOptions, t, defaultSortOptions)}
      searchSettings={{
        textSearchProperties: defaultSearchProperties =>
          textSearchProperties(defaultSearchProperties),
      }}
    />
  );
};

const ExtensibilityList = () => {
  const resMetaData = useGetCRbyPath();
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
          <ExtensibilityListCore resMetaData={resMetaData} />
        </ExtensibilityErrBoundary>
      </DataSourcesContextProvider>
    </TranslationBundleContext.Provider>
  );
};

export default ExtensibilityList;
