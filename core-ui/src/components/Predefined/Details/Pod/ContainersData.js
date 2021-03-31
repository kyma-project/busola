import React from 'react';
import PropTypes from 'prop-types';
import LuigiClient from '@luigi-project/client';

import {
  Panel,
  FormItem,
  FormLabel,
  LayoutGrid,
  Link,
} from 'fundamental-react';
import './ContainersData.scss';

const SecretComponent = ({ name, value }) => (
  <FormItem className="item-wrapper">
    <LayoutGrid cols="2">
      <FormLabel>{name}:</FormLabel>
      <div>{value}</div>
    </LayoutGrid>
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
    <Panel.Filters>
      <Link
        className="link"
        onClick={() =>
          LuigiClient.linkManager().navigate(`containers/${container.name}`)
        }
      >
        <Panel.Head title={container.name} />
      </Link>
    </Panel.Filters>
    <Panel.Body>
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
    </Panel.Body>
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
    <Panel className="fd-has-margin-m container-panel">
      <Panel.Header className="fd-has-padding-xs">
        <Panel.Head title={type} />
      </Panel.Header>

      {containers.map(container => (
        <ContainerComponent key={container.name} container={container} />
      ))}
    </Panel>
  );
}
