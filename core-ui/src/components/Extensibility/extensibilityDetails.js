import React, { useEffect, useState } from 'react';
import { useGetCRbyPath } from './useGetCRbyPath';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { CreateExtensibilityList } from './components/CreateExtensibilityList';
import { CreateReadOnlyEditor } from './components/CreateMonacoReadOnlyEditor';
import { CreateDetailPanel } from './components/CreateDetailPanel';
import { usePrepareDetailsProps } from 'resources/helpers';
import { DetailsSchema } from './components/DetailsSchema';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

export const ExtensibilityDetails = () => {
  const resMetaData = useGetCRbyPath();
  const detailsProps = usePrepareDetailsProps(
    resMetaData.navigation.path,
    resMetaData.navigation.label,
  );
  console.log(resMetaData);

  if (resMetaData.navigation.resource.kind) {
    detailsProps.resourceUrl = detailsProps.resourceUrl.replace(
      resMetaData.navigation.path,
      resMetaData.navigation.resource.kind.toLowerCase(),
    );
  }

  const schema = resMetaData.create?.simple?.schema;
  console.log(schema);

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
