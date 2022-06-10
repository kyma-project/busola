import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { usePrepareListProps } from 'resources/helpers';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';

import { useGetCRbyPath } from './useGetCRbyPath';
import { ExtensibilityCreate } from './ExtensibilityCreate';
import { TranslationBundleContext, useGetTranslation } from './helpers';
import { Widget } from './components/Widget';

export const ExtensibilityListCore = ({ resMetaData }) => {
  const { t, widgetT } = useGetTranslation();

  const schema = resMetaData?.schema;

  const listProps = usePrepareListProps(
    resMetaData.navigation.path,
    resMetaData.navigation.label,
  );

  if (resMetaData.resource?.kind) {
    listProps.resourceUrl = listProps.resourceUrl.replace(
      /[a-z0-9-]+\/?$/,
      (resMetaData.resource?.kind).toLowerCase(),
    );
  }
  listProps.createFormProps = { resource: resMetaData };
  listProps.resourceName = t('name', {
    defaultValue: resMetaData.resource?.kind,
  });
  listProps.description = t('description', {
    defaultValue: ' ',
  });
  listProps.customColumns = (resMetaData.list || []).map(column => ({
    header: widgetT(column),
    value: resource => (
      <Widget value={resource} structure={column} schema={schema} />
    ),
  }));
  return (
    <ResourcesList createResourceForm={ExtensibilityCreate} {...listProps} />
  );
};

export const ExtensibilityList = () => {
  const { t } = useTranslation();
  const resMetaData = useGetCRbyPath();

  return (
    <TranslationBundleContext.Provider value={resMetaData.navigation.path}>
      <ErrorBoundary
        customMessage={t('extensibility.error')}
        displayButton={false}
      >
        <ExtensibilityListCore resMetaData={resMetaData} />
      </ErrorBoundary>
    </TranslationBundleContext.Provider>
  );
};
