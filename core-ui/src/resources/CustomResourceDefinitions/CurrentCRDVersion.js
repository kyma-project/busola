import React from 'react';
import { LayoutPanel } from 'fundamental-react';

import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { useTranslation } from 'react-i18next';

import { SchemaViewer } from 'shared/components/SchemaViewer/SchemaViewer';
import { CustomResources } from 'components/CustomResources/CustomResources';
import './CurrentCRDVersion.scss';

const AdditionalPrinterColumns = ({ additionalPrinterColumns }) => {
  const { t } = useTranslation();

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
    />
  );
};

export const CurrentCRDVersion = resource => {
  const { t } = useTranslation();

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
          >
            {t('custom-resource-definitions.status.storage')}
          </StatusBadge>
        )}
      </LayoutPanel.Header>
      <CustomResources
        crd={resource}
        version={storageVersion}
        omitColumnsIds={
          resource.spec.scope !== 'Namespaced' ? ['namespace'] : []
        }
        hideCreateOption={true}
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
