import React from 'react';

import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { useTranslation } from 'react-i18next';

import { SchemaViewer } from 'shared/components/SchemaViewer/SchemaViewer';
import { CustomResources } from 'components/CustomResources/CustomResources';
import { Title } from '@ui5/webcomponents-react';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';

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
    <UI5Panel
      key="crd-version"
      title={
        <>
          <Title level="H4">{`${t(
            'custom-resource-definitions.subtitle.version',
          )} ${storageVersion.name}`}</Title>
          <StatusBadge
            type={storageVersion.served ? 'Success' : 'Information'}
            className="version-status"
            resourceKind="custom-resource-definitions"
          >
            {storageVersion.served
              ? t('custom-resource-definitions.status.served')
              : t('custom-resource-definitions.status.not-served')}
          </StatusBadge>
          {storageVersion.storage && (
            <StatusBadge
              type="Success"
              className="version-status"
              resourceKind="custom-resource-definitions"
            >
              {t('custom-resource-definitions.status.storage')}
            </StatusBadge>
          )}
        </>
      }
    >
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
    </UI5Panel>
  );
};
