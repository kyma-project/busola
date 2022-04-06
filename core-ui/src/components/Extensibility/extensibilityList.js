import React from 'react';
import { useGetCRbyPath } from './useGetCRbyPath';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { usePrepareListProps } from 'routing/createResourceRoutes';

export const ExtensibilityList = () => {
  const resource = useGetCRbyPath();
  const listProps = usePrepareListProps(resource.nav.path, resource.nav.label);
  if (resource.nav.resourceType) {
    listProps.resourceUrl = listProps.resourceUrl.replace(
      /[a-z0-9-]+$/,
      resource.nav.resourceType,
    );
  }
  return <ResourcesList {...listProps} />;
};
