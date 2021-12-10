import React from 'react';
import { MonacoEditor } from 'react-shared';
import LuigiClient from '@luigi-project/client';
import { LayoutPanel } from 'fundamental-react';
import * as jp from 'jsonpath';

import {
  GenericList,
  StatusBadge,
  prettifyNamePlural,
  EMPTY_TEXT_PLACEHOLDER,
  useTheme,
} from 'react-shared';
import { useTranslation } from 'react-i18next';

import { ComponentForList } from 'shared/getComponents';
import './CustomResourceDefinitionVersions.scss';

const CustomResources = ({ resource, namespace, version, i18n }) => {
  const { t } = useTranslation();
  const { group, names } = resource.spec;
  const name = names.plural;

  if (!version.served) {
    return (
      <GenericList
        title={prettifyNamePlural(undefined, name)}
        notFoundMessage={t('custom-resource-definitions.messages.no-entries')}
        entries={[]}
        headerRenderer={() => []}
        rowRenderer={() => []}
        i18n={i18n}
      />
    );
  }

  const resourceUrl = namespace
    ? `/apis/${group}/${version.name}/namespaces/${namespace}/${name}`
    : `/apis/${group}/${version.name}/${name}`;

  const navigateFn = resourceName => {
    LuigiClient.linkManager()
      .fromClosestContext()
      .navigate(`${version.name}/${resourceName}`);
  };

  const getJsonPath = (resource, jsonPath) => {
    const value =
      jp.value(resource, jsonPath.substring(1)) || EMPTY_TEXT_PLACEHOLDER;
    return typeof value === 'boolean' ? value.toString() : value;
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
    testid: 'crd-custom-resources',
  };

  return <ComponentForList name={name} params={params} />;
};

const AdditionalPrinterColumns = ({ additionalPrinterColumns }) => {
  const { t, i18n } = useTranslation();

  const headerRenderer = () => [
    t('common.headers.name'),
    t('custom-resource-definitions.headers.type'),
    t('custom-resource-definitions.headers.description'),
    t('custom-resource-definitions.headers.json-path'),
  ];
  const rowRenderer = entry => [
    entry.name,
    entry.type,
    entry.description || EMPTY_TEXT_PLACEHOLDER,
    entry.jsonPath,
  ];

  return (
    <GenericList
      title={t('custom-resource-definitions.subtitle.additional-columns')}
      entries={additionalPrinterColumns}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      testid="crd-additional-printer-columns"
      i18n={i18n}
    />
  );
};

export const CustomResourceDefinitionVersions = resource => {
  const { t, i18n } = useTranslation();

  const { editorTheme } = useTheme();
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
            <LayoutPanel.Head
              title={`${t('custom-resource-definitions.subtitle.version')} ${
                version.name
              }`}
            />
            <StatusBadge
              type={version.served ? 'positive' : 'informative'}
              className="version-status"
              tooltipContent={
                version.served
                  ? t('custom-resource-definitions.tooltips.served')
                  : t('custom-resource-definitions.tooltips.not-served')
              }
            >
              {version.served
                ? t('custom-resource-definitions.status.served')
                : t('custom-resource-definitions.status.not-served')}
            </StatusBadge>
            {version.storage && (
              <StatusBadge
                type="positive"
                className="version-status"
                tooltipContent={t(
                  'custom-resource-definitions.tooltips.storage',
                )}
              >
                {t('custom-resource-definitions.status.storage')}
              </StatusBadge>
            )}
          </LayoutPanel.Header>
          <CustomResources
            resource={resource}
            version={version}
            namespace={namespace}
            i18n={i18n}
          />
          <AdditionalPrinterColumns
            additionalPrinterColumns={version?.additionalPrinterColumns || []}
          />
          {version.schema && (
            <LayoutPanel
              key={`crd-schema-${version.name}`}
              className="fd-margin--md"
            >
              <LayoutPanel.Header>
                <LayoutPanel.Head
                  title={t('custom-resource-definitions.subtitle.schema')}
                />
              </LayoutPanel.Header>
              <LayoutPanel.Body>
                <MonacoEditor
                  key={`crd-schema-editor-${version.name}`}
                  theme={editorTheme}
                  language="json"
                  height="20em"
                  value={prettifySchema(version.schema)}
                  options={{
                    readOnly: true,
                    minimap: {
                      enabled: false,
                    },
                    scrollbar: {
                      alwaysConsumeMouseWheel: false,
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
