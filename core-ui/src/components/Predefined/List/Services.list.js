import React from 'react';

export const ServicesList = DefaultRenderer => ({ ...otherParams }) => {
  const getEndpoints = service => {
    if (service.spec.ports?.length) {
      return service.spec.ports.map(port => {
        const portValue = `${service.metadata.name}.${otherParams.namespace}:${port.port} ${port.protocol}`;
        return <li key={portValue}>{portValue}</li>;
      });
    } else {
      return '';
    }
  };

  const customColumns = [
    {
      header: 'Cluster IP',
      value: service => {
        return service.spec.clusterIP;
      },
    },
    {
      header: 'Endpoints',
      value: service => {
        return getEndpoints(service);
      },
    },
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};
