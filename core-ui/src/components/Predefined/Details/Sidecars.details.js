import React from 'react';
import { useTranslation } from 'react-i18next';

import { Labels, EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';

const WorkloadSelector = sidecar => {
  const { t } = useTranslation();

  return (
    <LayoutPanel className="fd-margin--md" key="workload-selector">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={t('sidecars.headers.workload-selector-labels')}
        />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <Labels labels={sidecar.spec?.workloadSelector?.labels} />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};

const IstioListeners = sidecar => {
  // const { t } = useTranslation();
  return (
    <>
      <ListenersView
        listeners={sidecar.spec?.egress}
        // type={t('sidecars.headers.egress-listeners')}
        type="Egress listener"
        key="Egress"
      />
      <ListenersView
        listeners={sidecar.spec?.ingress}
        // type={t('sidecars.headers.ingress-listeners')}
        type="Ingress listener"
        key="Ingress"
      />
    </>
  );
};

const Hosts = ({ hosts }) => {
  return (
    <ul>
      {hosts.map((host, i) => (
        <li key={i}>{host}</li>
      ))}
    </ul>
  );
};

const Port = ({ port }) => {
  const { t } = useTranslation();

  return (
    // <LayoutPanel.Body
    //   style={{
    //     // 'margin-left': '20px',
    //   }}
    // >
    <div>
      <br />

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

const Listener = ({ listener, type }) => {
  const { t } = useTranslation();

  return (
    <LayoutPanel className="fd-margin--md" key={listener}>
      <LayoutPanel.Body>
        <LayoutPanelRow
          name={t('sidecars.headers.bind')}
          value={listener?.bind || EMPTY_TEXT_PLACEHOLDER}
          key={listener?.bind}
        />
        <LayoutPanelRow
          name={t('sidecars.headers.capture-mode')}
          value={listener?.captureMode || EMPTY_TEXT_PLACEHOLDER}
          key={listener?.captureMode}
        />
        {type === 'Egress listener' ? (
          <LayoutPanelRow
            name={t('sidecars.headers.hosts')}
            value={<Hosts hosts={listener?.hosts} />}
            key={listener?.hosts}
          />
        ) : (
          <LayoutPanelRow
            name={t('sidecars.headers.default-endpoint')}
            value={listener?.defaultEndpoint}
            key={listener?.defaultEndpoint}
          />
        )}
        <LayoutPanelRow
          name="Port"
          value={
            listener?.port ? (
              <Port port={listener?.port} />
            ) : (
              EMPTY_TEXT_PLACEHOLDER
            )
          }
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};

const ListenersView = ({ listeners, type }) => {
  return (
    <LayoutPanel className="fd-margin--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={type} />
      </LayoutPanel.Header>
      {listeners?.map((listener, i) => (
        <Listener listener={listener} type={type} key={i} />
      ))}
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
