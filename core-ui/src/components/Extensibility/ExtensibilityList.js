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
  getValue,
  applySortFormula,
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
          />
        ),
      }))
    : [];

  const isFilterAString = typeof resMetaData.resource?.filter === 'string';
  const filterFn = value =>
    applyFormula(value, resMetaData.resource.filter, tBusola);
  listProps.filterFn = isFilterAString ? filterFn : undefined;

  const sortChildren = (resMetaData?.list || []).filter(
    element => element.sort,
    [],
  );

  const getSortingFunction = child => {
    const { path, formula } = child;
    return (a, b) => {
      const aValue = getValue(a, path);
      const bValue = getValue(b, path);
      console.log(aValue);
      console.log(bValue);
      switch (typeof aValue) {
        case 'number' || 'boolean':
          return aValue - bValue;
        case 'string': {
          if (Date.parse(aValue)) {
            return new Date(aValue).getTime() - new Date(bValue).getTime();
          }
          return aValue.localeCompare(bValue);
        }
        default:
          if (!formula) {
            const parsedValueA = JSON.parse(aValue);
            const parsedValueB = JSON.parse(bValue);
            return parsedValueA.localeCompare(parsedValueB);
          }
          const aFormula = applyFormula(aValue, formula);
          const bFormula = applyFormula(bValue, formula);

          return aFormula - bFormula;
      }
    };
  };

  const sortBy = defaultSortOptions => {
    let defaultSort = {};
    const sortingOptions = sortChildren.reduce((acc, child) => {
      const sortName = child.name || t(child.path);
      let sortFn = getSortingFunction(child);

      if (child.sort.fn) {
        sortFn = (a, b) => {
          const aValue = getValue(a, child.path);
          const bValue = getValue(b, child.path);
          const sortFormula = applySortFormula(child.sort.fn, t);
          return sortFormula(aValue, bValue);
        };
      }

      if (child.sort.default) {
        defaultSort[sortName] = sortFn;
        return { ...acc };
      } else {
        acc[sortName] = sortFn;
        return { ...acc };
      }
    }, {});

    return { ...defaultSort, ...defaultSortOptions, ...sortingOptions };
  };

  return (
    <ResourcesList
      createResourceForm={ExtensibilityCreate}
      allowSlashShortcut
      disableCreate={disableCreate}
      sortBy={sortBy}
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
