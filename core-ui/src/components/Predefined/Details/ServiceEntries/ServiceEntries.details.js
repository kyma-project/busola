import { LayoutPanel } from 'fundamental-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER, GenericList } from 'react-shared';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { WorkloadSelector } from 'shared/components/WorkloadSelector/WorkloadSelector';
import { Tokens } from 'shared/components/Tokens';
import { Endpoints } from './Endpoints';

const Ports = serviceentry => {
  const { t, i18n } = useTranslation();

  const ports = serviceentry.spec?.ports;

  const headerRenderer = _ => [
    t('common.headers.name'),
    t('serviceentries.headers.ports.number'),
    t('serviceentries.headers.ports.protocol'),
    t('serviceentries.headers.ports.target-point'),
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
      title={t('serviceentries.headers.ports.title')}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      entries={ports || []}
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
        <LayoutPanel.Head title={t('serviceentries.headers.configuration')} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <LayoutPanelRow
          name={t('serviceentries.headers.hosts')}
          value={<Tokens tokens={spec?.hosts} />}
          key={spec?.hosts}
        />
        <LayoutPanelRow
          name={t('serviceentries.headers.addresses')}
          value={<Tokens tokens={spec?.addresses} />}
          key={spec?.addresses}
        />
        <LayoutPanelRow
          name={t('serviceentries.headers.export-to')}
          value={
            spec.exportTo?.length > 0 ? (
              <Tokens tokens={spec?.exportTo} />
            ) : (
              t('serviceentries.headers.export-to-empty')
            )
          }
          key={spec?.exportTo}
        />
        <LayoutPanelRow
          name={t('serviceentries.headers.subject-alt-names')}
          value={<Tokens tokens={spec?.subjectAltNames} />}
          key={spec?.subjectAltNames}
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};

const Workloads = se => {
  return (
    <div>
      {se.spec?.endpoints?.length > 0 ? (
        <Endpoints serviceentry={se} />
      ) : (
        <WorkloadSelector
          resource={se}
          labels={se.spec?.workloadSelector?.labels}
        />
      )}
    </div>
  );
};

export function ServiceEntriesDetails({ DefaultRenderer, ...otherParams }) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('serviceentries.headers.resolution'),
      value: se => se.spec.resolution,
    },
    {
      header: t('serviceentries.headers.location'),
      value: se => se.spec?.location || EMPTY_TEXT_PLACEHOLDER,
    },
  ];

  return (
    <DefaultRenderer
      customComponents={[Configuration, Ports, Workloads]}
      customColumns={customColumns}
      {...otherParams}
    />
  );
}
