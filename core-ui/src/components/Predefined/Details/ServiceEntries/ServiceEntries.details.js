import { LayoutPanel } from 'fundamental-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER, GenericList } from 'react-shared';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { Selector } from 'shared/components/Selector/Selector';
import { Tokens } from 'shared/components/Tokens';
import { Endpoints } from './Endpoints';

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
          value={<Tokens tokens={spec?.hosts} />}
        />
        <LayoutPanelRow
          name={t('service-entries.headers.addresses')}
          value={<Tokens tokens={spec?.addresses} />}
        />
        <LayoutPanelRow
          name={t('service-entries.headers.export-to')}
          value={
            spec.exportTo?.length > 0 ? (
              <Tokens tokens={spec?.exportTo} />
            ) : (
              t('service-entries.headers.export-to-empty')
            )
          }
        />
        <LayoutPanelRow
          name={t('service-entries.headers.subject-alt-names')}
          value={<Tokens tokens={spec?.subjectAltNames} />}
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};

const Workloads = se => {
  const { t } = useTranslation();

  return (
    <div key="se-workloads">
      {se.spec?.endpoints?.length > 0 ? (
        <Endpoints serviceentry={se} />
      ) : (
        <Selector
          resource={se}
          labels={se.spec?.workloadSelector?.labels}
          title={t('workload-selector.title')}
        />
      )}
    </div>
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
      customComponents={[Configuration, Ports, Workloads]}
      customColumns={customColumns}
      {...otherParams}
    />
  );
}
