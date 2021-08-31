import React from 'react';
import PropTypes from 'prop-types';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';

import { LayoutPanel, FormItem, FormLabel, Button } from 'fundamental-react';
import './ContainersData.scss';

const SecretComponent = ({ name, value }) => (
  <FormItem className="item-wrapper">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <FormLabel className="form-label">{name}:</FormLabel>
      <div>{value}</div>
    </div>
  </FormItem>
);

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

export default function ContainersData({ type, containers }) {
  const { t } = useTranslation();

  const ContainerComponent = ({ container }) => (
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
        <SecretComponent
          name={t('common.headers.name')}
          value={container.name}
        />
        {container.image && (
          <SecretComponent
            name={t('pods.labels.image')}
            value={container.image}
          />
        )}
        {container.imagePullPolicy && (
          <SecretComponent
            name={t('pods.labels.image-pull-policy')}
            value={container.imagePullPolicy}
          />
        )}
        {container.ports && (
          <SecretComponent
            name={t('pods.labels.ports')}
            value={getPorts(container.ports)}
          />
        )}
      </LayoutPanel.Body>
    </>
  );

  const Wrapper = ({ children }) => (
    <div className="container-wrapper">{children}</div>
  );

  if (!containers) {
    return (
      <Wrapper>
        {t('pods.message.type-not-found', {
          type: type,
        })}
      </Wrapper>
    );
  }

  return (
    <LayoutPanel className="fd-margin--md container-panel">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={type} />
      </LayoutPanel.Header>

      {containers.map(container => (
        <ContainerComponent key={container.name} container={container} />
      ))}
    </LayoutPanel>
  );
}
