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
} from './helpers';
import { Widget } from './components/Widget';
import { RelationsContextProvider } from './contexts/RelationsContext';
import { ExtensibilityErrBoundary } from 'components/Extensibility/ExtensibilityErrBoundary';

export const ExtensibilityListCore = ({ resMetaData }) => {
  const { t, widgetT } = useGetTranslation();

  console.log(resMetaData);

  const { path, kind, disableCreate } = resMetaData?.resource ?? {};

  const schema = resMetaData?.schema;
  const relations = resMetaData?.relations || {};

  const listProps = usePrepareListProps(path, 'name');

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

  listProps.description = useCreateResourceDescription(
    resMetaData?.resource?.description,
  );

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
  const { path } = resMetaData?.resource ?? {};

  return (
    <TranslationBundleContext.Provider
      value={{
        translationBundle: path,
        defaultResourcePlaceholder: resMetaData?.resource?.defaultPlaceholder,
      }}
    >
      <RelationsContextProvider relations={resMetaData?.relations || {}}>
        <ExtensibilityErrBoundary key={path}>
          <ExtensibilityListCore resMetaData={resMetaData} />
        </ExtensibilityErrBoundary>
      </RelationsContextProvider>
    </TranslationBundleContext.Provider>
  );
};

export default ExtensibilityList;
