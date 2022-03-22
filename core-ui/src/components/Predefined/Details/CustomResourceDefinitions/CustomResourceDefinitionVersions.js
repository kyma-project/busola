import React from 'react';
import LuigiClient from '@luigi-project/client';
import { LayoutPanel } from 'fundamental-react';

import { GenericList, StatusBadge, EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { useTranslation } from 'react-i18next';

import { SchemaViewer } from 'shared/components/SchemaViewer/SchemaViewer';
import './CustomResourceDefinitionVersions.scss';
import { CustomResources } from './CustomResources';

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
        crd={resource}
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
