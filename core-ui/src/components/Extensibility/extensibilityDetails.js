import React, { useEffect, useState } from 'react';
import { useGetCRbyPath } from './useGetCRbyPath';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { usePrepareDetailsProps } from 'routing/createResourceRoutes';
import {
  CreateExtensibilityList,
  getResourceChild,
} from './components/CreateExtensibilityList';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';

export const ExtensibilityDetails = () => {
  const resMetaData = useGetCRbyPath();
  const detailsProps = usePrepareDetailsProps(
    resMetaData.nav.path,
    resMetaData.nav.label,
  );
  if (resMetaData.nav.resourceType) {
    detailsProps.resourceUrl = detailsProps.resourceUrl.replace(
      resMetaData.nav.path,
      resMetaData.nav.resourceType,
    );
  }

  const CreateReadOnlyEditor = monacoMetadata => resource => {
    const value = getResourceChild(monacoMetadata.resource, resource);
    return (
      <ReadonlyEditorPanel
        title={monacoMetadata.title}
        key={monacoMetadata.title}
        value={JSON.stringify(value, null, 2)}
      />
    );
  };

  const customColumns = [];
  const [customComponents, setCustomComponents] = useState([]);

  useEffect(() => {
    const { components } = resMetaData.details;
    const lists = components?.filter(ele => ele.type === 'list') || [];
    const editors = components?.filter(ele => ele.type === 'monaco') || [];
    setCustomComponents([
      ...editors.map(CreateReadOnlyEditor),
      ...lists.map(CreateExtensibilityList),
    ]);
  }, [resMetaData]);

  return (
    <ResourceDetails
      customColumns={customColumns}
      customComponents={customComponents}
      {...detailsProps}
    />
  );
};
