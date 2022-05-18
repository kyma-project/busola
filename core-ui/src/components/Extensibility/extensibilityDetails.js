import React from 'react';
import { useGetCRbyPath } from './useGetCRbyPath';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { usePrepareDetailsProps } from 'resources/helpers';
import { DetailsSchema } from './components/DetailsSchema';

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

  const schema = resMetaData.create?.simple?.schema;

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
