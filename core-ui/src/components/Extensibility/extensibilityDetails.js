import React, { useEffect, useState } from 'react';
import { useGetCRbyPath } from './useGetCRbyPath';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { CreateExtensibilityList } from './components/CreateExtensibilityList';
import { CreateReadOnlyEditor } from './components/CreateMonacoReadOnlyEditor';
import { CreateDetailPanel } from './components/CreateDetailPanel';
import { usePrepareDetailsProps } from 'resources/helpers';
export const ExtensibilityDetails = () => {
  const resMetaData = useGetCRbyPath();
  const detailsProps = usePrepareDetailsProps(
    resMetaData.navigation.path,
    resMetaData.navigation.label,
  );

  if (resMetaData.navigation.resource.kind) {
    detailsProps.resourceUrl = detailsProps.resourceUrl.replace(
      resMetaData.navigation.path,
      resMetaData.navigation.resource.kind.toLowerCase(),
    );
  }

  // const translate = useGetTranslation();

  const customColumns = [];
  const [customComponents, setCustomComponents] = useState([]);

  useEffect(() => {
    const { components } = resMetaData.details;
    const lists = components?.filter(ele => ele.type === 'list') || [];
    const editors = components?.filter(ele => ele.type === 'monaco') || [];
    const detailPanels =
      components?.filter(ele => ele.type === 'detail-panel') || [];
    setCustomComponents([
      ...editors.map(CreateReadOnlyEditor),
      ...lists.map(CreateExtensibilityList),
      ...detailPanels.map(CreateDetailPanel),
    ]);
  }, [resMetaData]);

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
      customColumns={customColumns}
      customComponents={customComponents}
      breadcrumbs={breadcrumbs}
      {...detailsProps}
    />
  );
};
