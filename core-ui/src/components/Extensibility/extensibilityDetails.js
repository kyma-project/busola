import React from 'react';
import { useGetCRbyPath } from './useGetCRbyPath';
import { usePrepareDetailsProps } from 'resources/helpers';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { prettifyNamePlural } from 'shared/utils/helpers';

import { Widget } from './components/Widget';
import {
  useGetTranslation,
  TranslationBundleContext,
} from './components/helpers';

export const ExtensibilityDetails = () => {
  const { t } = useGetTranslation();
  const resMetaData = useGetCRbyPath();

  console.log('resMetaData', resMetaData);

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
    <TranslationBundleContext.Provider value={resMetaData.navigation.path}>
      <ResourceDetails
        windowTitle={prettifyNamePlural(
          resMetaData.navigation.label || resMetaData.navigation.path,
        )}
        customColumns={header.map(def => ({
          header: t(def.path || def.id),
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
    </TranslationBundleContext.Provider>
  );
};
