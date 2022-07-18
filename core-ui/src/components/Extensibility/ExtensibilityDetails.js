import React from 'react';
import { useTranslation } from 'react-i18next';
import pluralize from 'pluralize';

import { usePrepareDetailsProps } from 'resources/helpers';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { prettifyKind } from 'shared/utils/helpers';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';

import { useGetCRbyPath } from './useGetCRbyPath';
import { shouldBeVisible, Widget } from './components/Widget';
import { useGetTranslation, TranslationBundleContext } from './helpers';
import { ExtensibilityCreate } from './ExtensibilityCreate';
import { RelationsContextProvider } from './contexts/RelationsContext';

export const ExtensibilityDetailsCore = ({ resMetaData }) => {
  const { t, widgetT } = useGetTranslation();
  const { path, kind } = resMetaData?.resource ?? {};

  const detailsProps = usePrepareDetailsProps(path, 'name');

  if (resMetaData?.resource?.kind) {
    detailsProps.resourceUrl = detailsProps.resourceUrl.replace(
      path,
      pluralize(kind).toLowerCase(),
    );
  }

  const header = resMetaData?.details?.header || [];
  const body = resMetaData?.details?.body || [];
  const schema = resMetaData?.schema;
  const relations = resMetaData?.relations || {};

  const breadcrumbs = [
    {
      name: t('name', {
        defaultValue: pluralize(prettifyKind(kind)),
      }),
      path: '/',
      fromContext: resMetaData?.resource?.path,
    },
    { name: '' },
  ];
  return (
    <ResourceDetails
      windowTitle={t('name', {
        defaultValue: pluralize(prettifyKind(kind)),
      })}
      customColumns={
        Array.isArray(header)
          ? header.map((def, i) => ({
              header: widgetT(def),
              visibility: resource => shouldBeVisible(resource, def.visibility),
              value: resource => (
                <Widget
                  key={i}
                  value={resource}
                  structure={def}
                  schema={schema}
                  relations={relations}
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
                  relations={relations}
                />
              ),
            ]
          : []
      }
      breadcrumbs={breadcrumbs}
      createResourceForm={ExtensibilityCreate}
      resourceSchema={resMetaData}
      {...detailsProps}
    />
  );
};

export const ExtensibilityDetails = () => {
  const { t } = useTranslation();
  const resMetaData = useGetCRbyPath();

  return (
    <TranslationBundleContext.Provider
      value={{
        translationBundle: resMetaData?.resource?.path,
        defaultResourcePlaceholder: resMetaData?.resource?.defaultPlaceholder,
      }}
    >
      <RelationsContextProvider relations={resMetaData?.relations || {}}>
        <ErrorBoundary
          customMessage={t('extensibility.error')}
          displayButton={false}
        >
          <ExtensibilityDetailsCore resMetaData={resMetaData} />
        </ErrorBoundary>
      </RelationsContextProvider>
    </TranslationBundleContext.Provider>
  );
};
