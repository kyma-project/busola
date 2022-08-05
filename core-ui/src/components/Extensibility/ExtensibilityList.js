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
} from './helpers';
import { Widget } from './components/Widget';
import { RelationsContextProvider } from './contexts/RelationsContext';
import { ExtensibilityErrBoundary } from 'components/Extensibility/ExtensibilityErrBoundary';
import { useGetSchema } from 'hooks/useGetSchema';
import { useTranslation } from 'react-i18next';

export const ExtensibilityListCore = ({ resMetaData }) => {
  const { t, widgetT } = useGetTranslation();
  const { t: tBusola } = useTranslation();

  const { urlPath, disableCreate, resource, description } =
    resMetaData?.general ?? {};
  const { kind, group, version } = resource;

  const openapiSchemaId = `${group}/${version}/${kind}`;
  const { schema } = useGetSchema({
    schemaId: openapiSchemaId,
  });

  const relations = resMetaData?.relations || {};

  const listProps = usePrepareListProps(urlPath, 'name');

  if (kind) {
    listProps.resourceUrl = listProps.resourceUrl.replace(
      /[a-z0-9-]+\/?$/,
      pluralize(kind).toLowerCase(),
    );
  }
  listProps.createFormProps = { resourceSchema: resMetaData };

  listProps.resourceName = t('name', {
    defaultValue: pluralize(prettifyKind(kind)),
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
            relations={relations}
            originalResource={resource}
          />
        ),
      }))
    : [];

  const isFilterAString = typeof resMetaData.resource.filter === 'string';
  const filterFn = value =>
    applyFormula(value, resMetaData.resource.filter, tBusola);
  listProps.filterFn = isFilterAString ? filterFn : undefined;

  return (
    <ResourcesList
      createResourceForm={ExtensibilityCreate}
      allowSlashShortcut
      disableCreate={disableCreate}
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
      <RelationsContextProvider relations={resMetaData?.relations || {}}>
        <ExtensibilityErrBoundary key={urlPath}>
          <ExtensibilityListCore resMetaData={resMetaData} />
        </ExtensibilityErrBoundary>
      </RelationsContextProvider>
    </TranslationBundleContext.Provider>
  );
};

export default ExtensibilityList;
