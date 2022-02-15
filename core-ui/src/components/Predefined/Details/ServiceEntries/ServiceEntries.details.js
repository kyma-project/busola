import React from 'react';
import { useTranslation } from 'react-i18next';

import { Labels, EMPTY_TEXT_PLACEHOLDER, GenericList } from 'react-shared';
import { LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { WorkloadSelector } from 'shared/WorkloadSelector/WorkloadSelector';

export const Hosts = ({ hosts }) => {
  return (
    <>
      {hosts ? (
        <ul>
          {hosts?.map((host, i) => (
            <li key={i}>{host}</li>
          ))}
        </ul>
      ) : (
        EMPTY_TEXT_PLACEHOLDER
      )}
    </>
  );
};

const Ports = serviceentry => {
  const { t, i18n } = useTranslation();

  const ports = serviceentry.spec?.ports;
  const headerRenderer = _ => [
    t('common.headers.name'),
    t('service-entries.headers.ports.number'),
    t('service-entries.headers.ports.protocol'),
    t('service-entries.headers.ports.target-point'),
  ];

  const rowRenderer = port => [
    port?.name,
    port?.number,
    port?.protocol,
    port?.targetPoint || EMPTY_TEXT_PLACEHOLDER,
  ];

  return (
    <GenericList
      key="serviceentries-ports"
      title={t('service-entries.headers.ports.title')}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      entries={ports || []}
      i18n={i18n}
      showSearchField={false}
    />
  );
};

const Endpoints = serviceentry => {
  const { t, i18n } = useTranslation();

  const headerRenderer = _ => [
    t('service-entries.headers.endpoints.address'),
    t('service-entries.headers.ports.title'),
    t('common.headers.labels'),
    t('service-entries.headers.endpoints.network'),
    t('service-entries.headers.endpoints.locality'),
    t('service-entries.headers.endpoints.weight'),
    t('service-accounts.name_singular'),
  ];
  const endpoints = serviceentry.spec?.endpoints;

  const rowRenderer = endpoint => [
    endpoint?.address,
    <Labels labels={endpoint.ports} />,
    <Labels labels={endpoint.labels} />,
    endpoint?.network || EMPTY_TEXT_PLACEHOLDER,
    endpoint?.locality || EMPTY_TEXT_PLACEHOLDER,
    endpoint?.weight || EMPTY_TEXT_PLACEHOLDER,
    endpoint?.serviceAccount || EMPTY_TEXT_PLACEHOLDER,
  ];

  return (
    <GenericList
      key="service-entries-endpoints"
      title={t('service-entries.headers.endpoints.title')}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      entries={endpoints || []}
      i18n={i18n}
      showSearchField={false}
    />
  );
};

const Configuration = ({ spec }) => {
  const { t } = useTranslation();

  return (
    <LayoutPanel className="fd-margin--md" key="se-configuration">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('service-entries.headers.configuration')} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <LayoutPanelRow
          name={t('service-entries.headers.hosts')}
          value={<Hosts hosts={spec?.hosts} />}
          key={spec?.hosts}
        />
        <LayoutPanelRow
          name={t('service-entries.headers.addresses')}
          value={<Hosts hosts={spec?.addresses} />}
          key={spec?.addresses}
        />
        <LayoutPanelRow
          name={t('service-entries.headers.export-to')}
          value={<Hosts hosts={spec?.exportTo} />}
          key={spec?.exportTo}
        />
        <LayoutPanelRow
          name={t('service-entries.headers.subject-alt-names')}
          value={<Hosts hosts={spec?.subjectAltNames} />}
          key={spec?.subjectAltNames}
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};

export function ServiceEntriesDetails({ DefaultRenderer, ...otherParams }) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('service-entries.headers.resolution'),
      value: se => se.spec.resolution,
    },
    {
      header: t('service-entries.headers.location'),
      value: se => se.spec?.location || EMPTY_TEXT_PLACEHOLDER,
    },
  ];

  return (
    <DefaultRenderer
      customComponents={[Configuration, Endpoints, Ports, WorkloadSelector]}
      customColumns={customColumns}
      {...otherParams}
    />
  );
}
