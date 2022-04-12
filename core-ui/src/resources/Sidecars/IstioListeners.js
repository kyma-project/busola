import React from 'react';
import { useTranslation } from 'react-i18next';

import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { Tokens } from 'shared/components/Tokens';

import './IstioListeners.scss';

export const IstioListeners = sidecar => {
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

const TrafficProperties = ({ properties, isEgress }) => {
  const { t } = useTranslation();

  return (
    <LayoutPanel.Body className="wrapper">
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
          value={<Tokens tokens={properties.hosts} />}
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
