import React from 'react';
import { useTranslation } from 'react-i18next';

import { Labels, EMPTY_TEXT_PLACEHOLDER, GenericList } from 'react-shared';
import { LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';

const WorkloadSelector = se => {
  const { t } = useTranslation();

  return (
    <LayoutPanel className="fd-margin--md" key="workload-selector">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={t('service-entries.headers.workload-selector-labels')}
        />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <Labels labels={se.spec?.workloadSelector?.labels} />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};

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
  const headerRenderer = _ => ['Name', 'Number', 'Protocol', 'Target Point'];

  const rowRenderer = port => [
    port?.name,
    port?.number,
    port?.protocol,
    port?.targetPoint || EMPTY_TEXT_PLACEHOLDER,
  ];

  return (
    <GenericList
      key="serviceentries-ports"
      title={t('service-entries.headers.ports')}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      entries={ports || []}
      i18n={i18n}
    />
  );
};

const Endpoints = serviceentry => {
  const { t, i18n } = useTranslation();

  const headerRenderer = _ => [
    'Address',
    'Ports',
    'Labels',
    'Network',
    'Locality',
    'Weight',
    'Service Account',
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
      key="serviceentries-endpoints"
      title={'Endpoints'}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      entries={endpoints || []}
      i18n={i18n}
    />
  );
};

const Port = ({ port }) => {
  const { t } = useTranslation();

  return (
    <div>
      <LayoutPanelRow
        name={t('sidecars.headers.port.number')}
        value={port.number}
      />
      <LayoutPanelRow
        name={t('sidecars.headers.port.protocol')}
        value={port.protocol}
      />
      <LayoutPanelRow name={t('common.headers.name')} value={port.name} />
      <LayoutPanelRow
        name={t('sidecars.headers.port.target-point')}
        value={port?.targetPoint || EMPTY_TEXT_PLACEHOLDER}
      />
    </div>
  );
};

const Configuration = ({ spec }) => {
  const { t } = useTranslation();

  return (
    <LayoutPanel className="fd-margin--md" key={'se-configuration'}>
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
    ></DefaultRenderer>
  );
}
