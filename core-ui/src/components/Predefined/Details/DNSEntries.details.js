import React from 'react';
import { useTranslation } from 'react-i18next';

import { LayoutPanel, FormItem, FormLabel } from 'fundamental-react';
import { StatusBadge } from 'react-shared';

const RowComponent = ({ name, value }) =>
  value ? (
    <FormItem className="item-wrapper">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr' }}>
        <FormLabel className="form-label">{name}:</FormLabel>
        <div>{value}</div>
      </div>
    </FormItem>
  ) : null;

const Provider = resource => {
  const { t } = useTranslation();

  return (
    <LayoutPanel key="provider-panel" className="fd-margin--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('dnsentries.headers.provider')} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <RowComponent
          name={t('dnsentries.headers.provider')}
          value={resource.status?.provider}
        />
        <RowComponent
          name={t('dnsentries.headers.provider-type')}
          value={resource.status?.providerType}
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};

const Spec = resource => {
  const { t } = useTranslation();
  if (!(resource.spec.dnsName || resource.spec.targets || resource.spec.ttl)) {
    return null;
  }

  const targets = (resource.spec?.targets || [])
    .toString()
    .replaceAll(',', ', ');
  return (
    <LayoutPanel key="specification-panel" className="fd-margin--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('dnsentries.headers.spec')} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        {resource.spec.dnsName && (
          <RowComponent
            name={t('dnsentries.headers.dns-name')}
            value={resource.spec.dnsName}
          />
        )}
        {resource.spec.targets && (
          <RowComponent
            name={t('dnsentries.headers.targets')}
            value={targets}
          />
        )}
        {resource.spec.ttl && (
          <RowComponent
            name={t('dnsentries.headers.ttl')}
            value={resource.spec.ttl}
          />
        )}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};

export const DNSEntriesDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('dnsentries.headers.status'),
      value: dnsentry => (
        <StatusBadge
          autoResolveType
          additionalContent={dnsentry.status?.message}
          noTooltip={dnsentry.status?.state === 'Ready'}
        >
          {dnsentry.status?.state || 'UNKNOWN'}
        </StatusBadge>
      ),
    },
  ];

  return (
    <DefaultRenderer
      customComponents={[Provider, Spec]}
      customColumns={customColumns}
      {...otherParams}
    ></DefaultRenderer>
  );
};
