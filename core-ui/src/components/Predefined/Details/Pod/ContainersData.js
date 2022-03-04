import React from 'react';
import PropTypes from 'prop-types';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';

import { LayoutPanel, Button } from 'fundamental-react';
import './ContainersData.scss';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { ContainerStatus } from './ContainerStatus';

const getPorts = ports => {
  if (ports?.length) {
    return ports.map(port => {
      const portValue = port.name
        ? `${port.name}:${port.containerPort}/${port.protocol}`
        : `${port.containerPort}/${port.protocol}`;
      return <li key={portValue}>{portValue}</li>;
    });
  } else {
    return '';
  }
};

ContainersData.propTypes = {
  containers: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default function ContainersData({ type, containers, statuses }) {
  const { t } = useTranslation();

  const ContainerComponent = ({ container, status }) => (
    <>
      <LayoutPanel.Header>
        <LayoutPanel.Head title={container.name} />
        <LayoutPanel.Actions>
          <Button
            aria-label={'view-logs-for-' + container.name}
            onClick={() =>
              LuigiClient.linkManager().navigate(`containers/${container.name}`)
            }
          >
            {t('pods.buttons.view-logs')}
          </Button>
        </LayoutPanel.Actions>
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <LayoutPanelRow
          name={t('common.headers.status')}
          value={<ContainerStatus status={status} />}
        />
        {container.image && (
          <LayoutPanelRow
            name={t('pods.labels.image')}
            value={container.image}
          />
        )}
        {container.imagePullPolicy && (
          <LayoutPanelRow
            name={t('pods.labels.image-pull-policy')}
            value={container.imagePullPolicy}
          />
        )}
        {container.ports && (
          <LayoutPanelRow
            name={t('pods.labels.ports')}
            value={getPorts(container.ports)}
          />
        )}
      </LayoutPanel.Body>
    </>
  );

  if (!containers) {
    return null;
  }

  return (
    <LayoutPanel className="fd-margin--md container-panel">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={type} />
      </LayoutPanel.Header>

      {containers.map(container => (
        <ContainerComponent
          key={container.name}
          container={container}
          status={statuses.find(status => status.name === container.name)}
        />
      ))}
    </LayoutPanel>
  );
}
