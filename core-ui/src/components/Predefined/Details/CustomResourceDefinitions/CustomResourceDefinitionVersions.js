import React from 'react';
import Editor from '@monaco-editor/react';
import LuigiClient from '@luigi-project/client';
import { LayoutPanel } from 'fundamental-react';

import { GenericList, EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { ComponentForList } from 'shared/getComponents';

const CustomResources = ({ resource, namespace, version }) => {
  const { group, names } = resource.spec;
  const name = names.plural;

  const resourceUrl = namespace
    ? `/apis/${group}/${version.name}/namespaces/${namespace}/${name}`
    : `/apis/${group}/${version.name}/${name}`;

  const navigateFn = resourceName => {
    LuigiClient.linkManager()
      .fromClosestContext()
      .navigate(`${version.name}/${resourceName}`);
  };

  const getJsonPath = (resource, jsonPath) => {
    return (
      jsonPath
        ?.substring(1)
        .split('.')
        .reduce((obj, i) => obj[i], resource) || EMPTY_TEXT_PLACEHOLDER
    );
  };

  const customColumns = version.additionalPrinterColumns?.map(column => ({
    header: column.name,
    value: resource => getJsonPath(resource, column.jsonPath),
  }));
  // CRD can have infinite number of additionalPrinterColumns what would be impossible to fit into the table
  if (customColumns?.length > 5) customColumns.length = 5;

  const params = {
    hasDetailsView: true,
    navigateFn,
    resourceUrl,
    resourceType: name,
    namespace,
    isCompact: true,
    showTitle: true,
    customColumns,
  };

  return <ComponentForList name={name} params={params} />;
};

const AdditionalPrinterColumns = version => {
  const headerRenderer = () => ['Name', 'Type', 'Description', 'JSON Path'];
  const rowRenderer = entry => [
    entry.name,
    entry.type,
    entry.description || EMPTY_TEXT_PLACEHOLDER,
    entry.jsonPath,
  ];

  return (
    <GenericList
      title="Additional Printer Columns"
      entries={version.additionalPrinterColumns || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
    />
  );
};

export const CustomResourceDefinitionVersions = resource => {
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
          <CustomResources
            resource={resource}
            version={version}
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
        </LayoutPanel>
      ))}
    </>
  );
};
