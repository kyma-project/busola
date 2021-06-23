import React from 'react';
import Editor from '@monaco-editor/react';
import LuigiClient from '@luigi-project/client';
import { LayoutPanel } from 'fundamental-react';

import { GenericList } from 'react-shared';
import { ComponentForList } from 'shared/getComponents';
import './CustomResources.list.scss';

function CustomResource({ resource, namespace, version }) {
  const { group, names } = resource.spec;
  const name = names.plural;

  const resourceUrl = namespace
    ? `/apis/${group}/${version}/namespaces/${namespace}/${name}`
    : `/apis/${group}/${version}/${name}`;

  const navigateFn = resourceName => {
    LuigiClient.linkManager()
      .fromClosestContext()
      .navigate(`${version}/${resourceName}`);
  };

  const params = {
    hasDetailsView: true,
    navigateFn,
    resourceUrl,
    resourceType: name,
    namespace,
    isCompact: true,
    showTitle: true,
  };

  return <ComponentForList name={name} params={params} />;
}
const AdditionalPrinterColumns = version => {
  const headerRenderer = () => ['name', 'type', 'jsonPath'];
  const rowRenderer = entry => [entry.name, entry.type, entry.jsonPath];

  return (
    <GenericList
      title="Additional Printer Columns"
      entries={version.additionalPrinterColumns || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
    />
  );
};

export function CustomResources(resource) {
  const namespace = LuigiClient.getContext().namespaceId;

  if (!resource) return null;
  const { versions } = resource.spec;

  const prettifySchema = schema => {
    return JSON.stringify(schema, null, 2);
  };
  return (
    <>
      {versions.map(version => (
        <LayoutPanel className="fd-margin--md">
          <LayoutPanel.Header>
            <LayoutPanel.Head title={`Version ${version.name}`} />
          </LayoutPanel.Header>
          <LayoutPanel.Body className="crd-version">
            <CustomResource
              resource={resource}
              version={version.name}
              namespace={namespace}
            />
            {version.additionalPrinterColumns && (
              <AdditionalPrinterColumns
                additionalPrinterColumns={version.additionalPrinterColumns}
              />
            )}
            {version.schema && (
              <LayoutPanel
                key={`crd-schema-${version.name}`}
                className="fd-margin--md"
              >
                <LayoutPanel.Header>
                  <LayoutPanel.Head title="Schema" />
                </LayoutPanel.Header>
                <LayoutPanel.Body>
                  <Editor
                    key={`crd-schema-editor-${version.name}`}
                    theme="vs-light"
                    height="20em"
                    value={prettifySchema(version.schema)}
                    options={{
                      readOnly: true,
                      minimap: {
                        enabled: false,
                      },
                    }}
                  />
                </LayoutPanel.Body>
              </LayoutPanel>
            )}
          </LayoutPanel.Body>
        </LayoutPanel>
      ))}
    </>
  );
}
