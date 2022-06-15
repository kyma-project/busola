import React from 'react';
import { useTranslation } from 'react-i18next';
import pluralize from 'pluralize';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { usePrepareListProps } from 'resources/helpers';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';

import { useGetCRbyPath } from './useGetCRbyPath';
import { ExtensibilityCreate } from './ExtensibilityCreate';
import { TranslationBundleContext, useGetTranslation } from './helpers';
import { Widget } from './components/Widget';

export const ExtensibilityListCore = ({ resMetaData }) => {
  const { t, widgetT } = useGetTranslation();
  const { path, kind } = resMetaData?.resource ?? {};

  const schema = resMetaData?.schema;

  const listProps = usePrepareListProps(path, 'name');

  if (kind) {
    listProps.resourceUrl = listProps.resourceUrl.replace(
      /[a-z0-9-]+\/?$/,
      pluralize(kind).toLowerCase(),
    );
  }
  listProps.createFormProps = { resource: resMetaData };
  listProps.resourceName = t('name', {
    defaultValue: kind,
  });
  listProps.description = t('description', {
    defaultValue: ' ',
  });
  listProps.customColumns = Array.isArray(resMetaData.list)
    ? resMetaData.list.map(column => ({
        header: widgetT(column),
        value: resource => (
          <Widget value={resource} structure={column} schema={schema} />
        ),
      }))
    : [];
  return (
    <ResourcesList createResourceForm={ExtensibilityCreate} {...listProps} />
  );
};

export const ExtensibilityList = () => {
  const { t } = useTranslation();
  const resMetaData = useGetCRbyPath();
  const { path } = resMetaData.resource ?? {};

  return (
    <TranslationBundleContext.Provider value={path}>
      <ErrorBoundary
        customMessage={t('extensibility.error')}
        displayButton={false}
        key={path}
      >
        <ExtensibilityListCore resMetaData={resMetaData} />
      </ErrorBoundary>
    </TranslationBundleContext.Provider>
  );
};
