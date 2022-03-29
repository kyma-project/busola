import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutPanel } from 'fundamental-react';
import { ResourceStatus } from 'shared/components/ResourceStatus/ResourceStatus';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { DNSEntriesCreate } from '../Create/DNSEntries/DNSEntries.create';

const RowComponent = ({ name, value }) =>
  value ? <LayoutPanelRow name={name} value={value} /> : null;

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

const DNSEntriesDetails = props => {
  const { t, i18n } = useTranslation();

  const customColumns = [
    {
      header: t('dnsentries.headers.status'),
      value: dnsentry => (
        <ResourceStatus
          status={dnsentry.status}
          resourceKind="dnsentries"
          i18n={i18n}
        />
      ),
    },
  ];

  return (
    <ResourceDetails
      customComponents={[Provider, Spec]}
      customColumns={customColumns}
      createResourceForm={DNSEntriesCreate}
      {...props}
    />
  );
};
export default DNSEntriesDetails;
