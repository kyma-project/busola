import React from 'react';
import pluralize from 'pluralize';

import { usePrepareDetailsProps } from 'resources/helpers';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { prettifyKind } from 'shared/utils/helpers';

import { useGetCRbyPath } from './useGetCRbyPath';
import { shouldBeVisible, Widget } from './components/Widget';
import { useGetTranslation, TranslationBundleContext } from './helpers';
import { ExtensibilityCreate } from './ExtensibilityCreate';
import { RelationsContextProvider } from './contexts/RelationsContext';
import { ExtensibilityErrBoundary } from 'components/Extensibility/ExtensibilityErrBoundary';

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
                  originalResource={resource}
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
                  originalResource={resource}
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

const ExtensibilityDetails = () => {
  const resMetaData = useGetCRbyPath();

  return (
    <TranslationBundleContext.Provider
      value={{
        translationBundle: resMetaData?.resource?.path || 'extensibility',
        defaultResourcePlaceholder: resMetaData?.resource?.defaultPlaceholder,
      }}
    >
      <RelationsContextProvider relations={resMetaData?.relations || {}}>
        <ExtensibilityErrBoundary>
          <ExtensibilityDetailsCore resMetaData={resMetaData} />
        </ExtensibilityErrBoundary>
      </RelationsContextProvider>
    </TranslationBundleContext.Provider>
  );
};

export default ExtensibilityDetails;
