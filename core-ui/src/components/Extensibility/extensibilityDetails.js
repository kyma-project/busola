import React, { useEffect, useState } from 'react';
import { useGetCRbyPath } from './useGetCRbyPath';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { usePrepareDetailsProps } from 'routing/createResourceRoutes';
import { CreateExtensibilityList } from './components/CreateExtensibilityList';

export const ExtensibilityDetails = () => {
  const resource = useGetCRbyPath();
  const detailsProps = usePrepareDetailsProps(
    resource.nav.path,
    resource.nav.label,
  );
  if (resource.nav.resourceType) {
    detailsProps.resourceUrl = detailsProps.resourceUrl.replace(
      resource.nav.path,
      resource.nav.resourceType,
    );
  }

  const customColumns = [];
  const [customComponents, setCustomComponents] = useState([]);

  useEffect(() => {
    console.log('useEffect entered', resource.details.components);
    const { components } = resource.details;
    const lists = components.filter(ele => ele.type === 'list');
    setCustomComponents(lists.map(CreateExtensibilityList));
  }, [resource]);
  return (
    <ResourceDetails
      customColumns={customColumns}
      customComponents={customComponents}
      {...detailsProps}
    />
  );
};
