import React from 'react';
import PropTypes from 'prop-types';
import LuigiClient from '@luigi-project/client';

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

const ContainerComponent = ({ container }) => (
  <>
    <LayoutPanel.Header>
      <LayoutPanel.Head title={container.name} />
      <LayoutPanel.Actions>
        <Button
          onClick={() =>
            LuigiClient.linkManager().navigate(`containers/${container.name}`)
          }
        >
          View Logs
        </Button>
      </LayoutPanel.Actions>
    </LayoutPanel.Header>
    <LayoutPanel.Body>
      <SecretComponent name="Name" value={container.name} />
      {container.image && (
        <SecretComponent name="Image" value={container.image} />
      )}
      {container.imagePullPolicy && (
        <SecretComponent
          name="Image pull policy"
          value={container.imagePullPolicy}
        />
      )}
      {container.ports && (
        <SecretComponent name="Ports" value={getPorts(container.ports)} />
      )}
    </LayoutPanel.Body>
  </>
);

ContainersData.propTypes = {
  containers: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default function ContainersData({ type, containers }) {
  const Wrapper = ({ children }) => (
    <div className="container-wrapper">{children}</div>
  );

  if (!containers) {
    return <Wrapper>{type} not found.</Wrapper>;
  }

  return (
    <LayoutPanel className="fd-has-margin-m container-panel">
      <LayoutPanel.Header className="fd-has-padding-xs">
        <LayoutPanel.Head title={type} />
      </LayoutPanel.Header>

      {containers.map(container => (
        <ContainerComponent key={container.name} container={container} />
      ))}
    </LayoutPanel>
  );
}
