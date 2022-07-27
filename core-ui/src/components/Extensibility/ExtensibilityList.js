import React from 'react';
import { useTranslation } from 'react-i18next';
import pluralize from 'pluralize';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { usePrepareListProps } from 'resources/helpers';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
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

export const ExtensibilityListCore = ({ resMetaData }) => {
  const { t, widgetT } = useGetTranslation();

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

export const ExtensibilityList = () => {
  const { t } = useTranslation();
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
        <ErrorBoundary
          customMessage={t('extensibility.error')}
          displayButton={false}
          key={path}
        >
          <ExtensibilityListCore resMetaData={resMetaData} />
        </ErrorBoundary>
      </RelationsContextProvider>
    </TranslationBundleContext.Provider>
  );
};
