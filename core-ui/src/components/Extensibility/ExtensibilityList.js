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
} from './helpers';
import { Widget } from './components/Widget';
import { DataSourcesContextProvider } from './contexts/DataSources';
import { ExtensibilityErrBoundary } from 'components/Extensibility/ExtensibilityErrBoundary';
import { useGetSchema } from 'hooks/useGetSchema';
import { useTranslation } from 'react-i18next';

export const ExtensibilityListCore = ({ resMetaData }) => {
  const { t, widgetT } = useGetTranslation();
  const { t: tBusola } = useTranslation();

  const { urlPath, disableCreate, resource, description } =
    resMetaData?.general ?? {};

  const dataSources = resMetaData?.dataSources || {};
  const { schema } = useGetSchema({
    resource,
  });

  const listProps = usePrepareListProps(urlPath, 'name');

  if (resource.kind) {
    listProps.resourceUrl = listProps.resourceUrl.replace(
      /[a-z0-9-]+\/?$/,
      pluralize(resource.kind).toLowerCase(),
    );
  }
  listProps.createFormProps = { resourceSchema: resMetaData };

  listProps.resourceName = t('name', {
    defaultValue: pluralize(prettifyKind(resource.kind)),
  });

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
  listProps.filterFn = isFilterAString ? filterFn : undefined;

  const sortOptions = (resMetaData?.list || []).filter(element => element.sort);

  return (
    <ResourcesList
      createResourceForm={ExtensibilityCreate}
      allowSlashShortcut
      disableCreate={disableCreate}
      sortBy={defaultSortOptions => sortBy(sortOptions, t, defaultSortOptions)}
      {...listProps}
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
