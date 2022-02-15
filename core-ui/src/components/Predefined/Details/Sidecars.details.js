import React from 'react';
import { useTranslation } from 'react-i18next';

import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { WorkloadSelector } from 'shared/WorkloadSelector/WorkloadSelector';

const IstioListeners = sidecar => {
  const { t } = useTranslation();
  return (
    <>
      <ListenerView
        listener={sidecar.spec?.egress}
        type={t('sidecars.headers.egress')}
        key="egress-listener"
        isEgress
      />
      <ListenerView
        listener={sidecar.spec?.ingress}
        type={t('sidecars.headers.ingress')}
        key="ingress-listener"
      />
    </>
  );
};

const Hosts = ({ hosts }) => {
  return (
    <ul>
      {hosts?.map((host, i) => (
        <li key={i}>{host}</li>
      ))}
    </ul>
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

const TrafficProperties = ({ properties, isEgress }) => {
  const { t } = useTranslation();

  return (
    <LayoutPanel className="fd-margin--md" key={properties}>
      <LayoutPanel.Body>
        <LayoutPanelRow
          name={t('sidecars.headers.port.title')}
          value={
            properties?.port ? (
              <Port port={properties?.port} />
            ) : (
              EMPTY_TEXT_PLACEHOLDER
            )
          }
        />
        <LayoutPanelRow
          name={t('sidecars.headers.bind')}
          value={properties?.bind || EMPTY_TEXT_PLACEHOLDER}
          key={properties?.bind}
        />
        <LayoutPanelRow
          name={t('sidecars.headers.capture-mode')}
          value={properties?.captureMode || EMPTY_TEXT_PLACEHOLDER}
          key={properties?.captureMode}
        />
        {isEgress ? (
          <LayoutPanelRow
            name={t('sidecars.headers.hosts')}
            value={<Hosts hosts={properties.hosts} />}
            key={properties.hosts}
          />
        ) : (
          <LayoutPanelRow
            name={t('sidecars.headers.default-endpoint')}
            value={properties?.defaultEndpoint}
            key={properties?.defaultEndpoint}
          />
        )}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};

const ListenerView = ({ listener, type, isEgress }) => {
  return (
    <LayoutPanel className="fd-margin--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={type} />
      </LayoutPanel.Header>
      {listener?.map((properties, i) => (
        <TrafficProperties
          properties={properties}
          key={i}
          isEgress={isEgress}
        />
      )) || <LayoutPanel.Body>{EMPTY_TEXT_PLACEHOLDER}</LayoutPanel.Body>}
    </LayoutPanel>
  );
};

export const SidecarsDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('sidecars.headers.outbound-traffic-policy'),
      value: sidecar =>
        sidecar.spec?.outboundTrafficPolicy?.mode || EMPTY_TEXT_PLACEHOLDER,
    },
  ];

  return (
    <DefaultRenderer
      customComponents={[IstioListeners, WorkloadSelector]}
      customColumns={customColumns}
      singularName={t('persistent-volume-claims.name_singular')}
      {...otherParams}
    />
  );
};
