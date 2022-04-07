import React from 'react';
import { useGetCRbyPath } from './useGetCRbyPath';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { usePrepareDetailsProps } from 'routing/createResourceRoutes';

///namespaces/default/jobs/major-leading-build-qvpcc
///namespaces/default/customjobs/jobs

export const ExtensibilityDetails = () => {
  const resource = useGetCRbyPath();
  const detailsProps = usePrepareDetailsProps(
    resource.nav.path,
    resource.nav.label,
  );
  console.log(resource);
  console.log(detailsProps.resourceUrl);

  console.log(
    detailsProps.resourceUrl.replace(
      resource.nav.path,
      resource.nav.resourceType,
    ),
  );
  if (resource.nav.resourceType) {
    detailsProps.resourceUrl = detailsProps.resourceUrl.replace(
      resource.nav.path,
      resource.nav.resourceType,
    );
  }
  return <ResourceDetails {...detailsProps} />;
};
