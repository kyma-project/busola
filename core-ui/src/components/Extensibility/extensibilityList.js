import React from 'react';
import { useGetCRbyPath } from './useGetCRbyPath';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { usePrepareListProps } from 'routing/createResourceRoutes';
import { ExtensibilityCreate } from './extensibilityCreate';

export const ExtensibilityList = () => {
  const resource = useGetCRbyPath();
  const listProps = usePrepareListProps(resource.nav.path, resource.nav.label);
  if (resource.nav.resourceType) {
    listProps.resourceUrl = listProps.resourceUrl.replace(
      /[a-z0-9-]+\/?$/,
      resource.nav.resourceType,
    );
  }
  listProps.createFormProps = { resource };

  return (
    <ResourcesList createResourceForm={ExtensibilityCreate} {...listProps} />
  );
};
