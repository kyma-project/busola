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

  if (resMetaData.resource.kind) {
    detailsProps.resourceUrl = detailsProps.resourceUrl.replace(
      resMetaData.navigation.path,
      resMetaData.resource.kind.toLowerCase(),
    );
  }

  const customColumns = [];
  const [customComponents, setCustomComponents] = useState([]);

  useEffect(() => {
    const { components } = resMetaData.details;

    const parse = components =>
      components.map(c => {
        switch (c.type) {
          case 'listPanel':
            return CreateExtensibilityList(c);
          case 'detailPanel':
            return CreateDetailPanel(c);
          case 'monacoPanel':
            return CreateReadOnlyEditor(c);
          default:
            return null;
        }
      }) || [];
    setCustomComponents(parse(components));
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
