import React from 'react';
import LuigiClient from '@luigi-project/client';
import { LayoutPanel } from 'fundamental-react';
import * as jp from 'jsonpath';

import {
  GenericList,
  StatusBadge,
  prettifyNamePlural,
  EMPTY_TEXT_PLACEHOLDER,
  useMicrofrontendContext,
} from 'react-shared';
import { useTranslation } from 'react-i18next';

import { ComponentForList } from 'shared/getComponents';
import { SchemaViewer } from 'shared/components/SchemaViewer/SchemaViewer';
import { navigateToResource } from 'shared/helpers/universalLinks';
import './CustomResourceDefinitionVersions.scss';

const CustomResources = ({ resource, namespace, version, i18n }) => {
  const { t } = useTranslation();
  const { group, names } = resource.spec;
  const name = names.plural;
  const { namespaceNodes, namespaceId } = useMicrofrontendContext();

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

  const navigateFn = cr => {
    const crdNamePlural = resource.spec.names.plural;
    const hasCustomPageInBusola = namespaceNodes.find(
      res => res.resourceType === crdNamePlural,
    );
    if (hasCustomPageInBusola) {
      navigateToResource({
        namespace: namespaceId,
        name: cr.metadata.name,
        kind: crdNamePlural,
      });
    } else {
      LuigiClient.linkManager()
        .fromClosestContext()
        .navigate(`${version.name}/${cr.metadata.name}`);
    }
  };

  const getJsonPath = (resource, jsonPath) => {
    const value =
      jp.value(resource, jsonPath.substring(1)) || EMPTY_TEXT_PLACEHOLDER;

    if (typeof value === 'boolean') {
      return value.toString();
    } else if (typeof value === 'object') {
      return JSON.stringify(value);
    } else {
      return value;
    }
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
    { content: entry.name, style: { wordBreak: 'keep-all' } },
    { content: entry.type, style: { wordBreak: 'keep-all' } },
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

  const namespace = LuigiClient.getContext().namespaceId;

  if (!resource) return null;
  const { versions } = resource.spec;

  const storageVersion = versions.find(v => v.storage);

  return (
    <LayoutPanel className="fd-margin--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={`${t('custom-resource-definitions.subtitle.version')} ${
            storageVersion.name
          }`}
        />
        <StatusBadge
          type={storageVersion.served ? 'positive' : 'informative'}
          className="version-status"
          resourceKind="custom-resource-definitions"
          i18n={i18n}
        >
          {storageVersion.served
            ? t('custom-resource-definitions.status.served')
            : t('custom-resource-definitions.status.not-served')}
        </StatusBadge>
        {storageVersion.storage && (
          <StatusBadge
            type="positive"
            className="version-status"
            resourceKind="custom-resource-definitions"
            i18n={i18n}
          >
            {t('custom-resource-definitions.status.storage')}
          </StatusBadge>
        )}
      </LayoutPanel.Header>
      <CustomResources
        resource={resource}
        version={storageVersion}
        namespace={namespace}
        i18n={i18n}
      />
      <AdditionalPrinterColumns
        additionalPrinterColumns={
          storageVersion?.additionalPrinterColumns || []
        }
      />
      {storageVersion.schema && (
        <SchemaViewer
          name={storageVersion.name}
          schema={storageVersion.schema}
        />
      )}
    </LayoutPanel>
  );
};
