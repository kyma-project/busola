import React, { useEffect, useState } from 'react';
import * as jp from 'jsonpath';
import { useGetCRbyPath } from './useGetCRbyPath';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { usePrepareDetailsProps } from 'routing/createResourceRoutes';
import {
  CreateExtensibilityList,
  getResourceChild,
} from './components/CreateExtensibilityList';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';

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

  const CreateDetailPanel = metadata => resource => {
    return (
      <LayoutPanel className="fd-margin--lg">
        <LayoutPanel.Header>
          <LayoutPanel.Head title={metadata.title} />
        </LayoutPanel.Header>
        <LayoutPanel.Body>
          {metadata.properties.map(prop => (
            <LayoutPanelRow
              key={prop.valuePath}
              name={prop.header}
              value={jp.value(resource, prop.valuePath)}
            />
          ))}
        </LayoutPanel.Body>
      </LayoutPanel>
    );
  };

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

  return (
    <ResourceDetails
      customColumns={customColumns}
      customComponents={customComponents}
      {...detailsProps}
    />
  );
};
