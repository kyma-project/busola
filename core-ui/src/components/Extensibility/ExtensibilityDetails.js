import React from 'react';

import { usePrepareDetailsProps } from 'resources/helpers';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { prettifyNamePlural } from 'shared/utils/helpers';

import { useGetCRbyPath } from './useGetCRbyPath';
import { Widget } from './components/Widget';
import { useGetTranslation, TranslationBundleContext } from './helpers';

export const ExtensibilityDetailsCore = ({ resMetaData }) => {
  const { widgetT } = useGetTranslation();

  const detailsProps = usePrepareDetailsProps(
    resMetaData.navigation.path,
    resMetaData.navigation.label,
  );

  if (resMetaData.resource.kind) {
    detailsProps.resourceUrl = detailsProps.resourceUrl.replace(
      resMetaData.navigation.path,
      resMetaData.resource.kind.toLowerCase(),
    );
  }

  const header = resMetaData?.details?.header || [];
  const body = resMetaData?.details?.body || [];
  const schema = resMetaData?.schema;

  const breadcrumbs = [
    {
      name: resMetaData.navigation.label || resMetaData.navigation.path,
      path: '/',
      fromContext: resMetaData.navigation.path,
    },
    { name: '' },
  ];
  return (
    <ResourceDetails
      windowTitle={prettifyNamePlural(
        resMetaData.navigation.label || resMetaData.navigation.path,
      )}
      customColumns={header.map(def => ({
        header: widgetT(def),
        value: resource => (
          <Widget value={resource} structure={def} schema={schema} />
        ),
      }))}
      customComponents={[
        resource => (
          <Widget value={resource} structure={body} schema={schema} />
        ),
      ]}
      breadcrumbs={breadcrumbs}
      {...detailsProps}
    />
  );
};

export const ExtensibilityDetails = () => {
  const resMetaData = useGetCRbyPath();

  return (
    <TranslationBundleContext.Provider value={resMetaData.navigation.path}>
      <ExtensibilityDetailsCore resMetaData={resMetaData} />
    </TranslationBundleContext.Provider>
  );
};
