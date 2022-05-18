import React from 'react';
import { useGetCRbyPath } from './useGetCRbyPath';
import { usePrepareDetailsProps } from 'resources/helpers';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { DetailsSchema } from './components/DetailsSchema';
import { prettifyNamePlural } from 'shared/utils/helpers';

export const ExtensibilityDetails = () => {
  const resMetaData = useGetCRbyPath();
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

  const schema = resMetaData.create?.simple?.schema || resMetaData?.schema;

  const customColumns = [];

  const breadcrumbs = [
    {
      name: resMetaData.navigation.label || resMetaData.navigation.path,
      path: '/',
      fromContext: resMetaData.navigation.path,
    },
    { name: '' },
  ];
  return (
    <>
      <ResourceDetails
        windowTitle={prettifyNamePlural(
          resMetaData.navigation.label || resMetaData.navigation.path,
        )}
        customColumns={customColumns}
        customComponents={[
          resource => <DetailsSchema resource={resource} schema={schema} />,
        ]}
        breadcrumbs={breadcrumbs}
        {...detailsProps}
      />
    </>
  );
};
