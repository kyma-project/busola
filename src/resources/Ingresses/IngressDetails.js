import { useTranslation } from 'react-i18next';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';

import { Rules } from './Rules';
import { DefaultBackendPanel } from './DefaultBackendPanel';
import IngressCreate from './IngressCreate';
import { ResourceDescription } from 'resources/Ingresses';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { IngressStatus } from './IngressStatus';
import { IngressSpecification } from './IngressSpecification';
import { useEffect, useState } from 'react';

const exampleStatus = {
  loadBalancer: {
    ingress: [
      {
        hostname: 'example-lb1.example.com',
        ports: [
          {
            port: 80,
            protocol: 'TCP',
            error: 'ServicePortConflict',
          },
          {
            port: 443,
            protocol: 'TCP',
          },
        ],
      },
      {
        ip: '192.0.2.2',
        ports: [
          {
            port: 80,
            protocol: 'TCP',
          },
        ],
      },
    ],
  },
};

export function IngressDetails(props) {
  const { t } = useTranslation();
  const [totalPods, setTotalPods] = useState(0);
  const [healthyPods, setHealthyPods] = useState(0);

  const calculateTotalPorts = ingress => {
    if (ingress.metadata.name === 'cafe-ingress')
      ingress.status = exampleStatus;
    let allPorts = 0;

    ingress?.status?.loadBalancer?.ingress?.forEach(element => {
      element?.ports?.forEach(() => allPorts++);
    });

    setTotalPods(allPorts);
  };

  const calculatePortsWithoutErrors = ingress => {
    //ingress.status = exampleStatus;
    let healthyPods = 0;

    ingress?.status?.loadBalancer?.ingress?.forEach(element => {
      element?.ports?.forEach(port => {
        if (!port.error) healthyPods++;
      });
    });

    setHealthyPods(healthyPods);
  };

  const customComponents = [];

  customComponents.push(resource => (
    <IngressSpecification resource={resource} />
  ));

  customComponents.push(resource =>
    resource.spec.defaultBackend ? (
      <DefaultBackendPanel
        key="default-backend"
        backend={resource.spec.defaultBackend}
        namespace={resource.metadata.namespace}
      />
    ) : null,
  );
  customComponents.push(resource =>
    resource.spec.rules ? (
      <Rules key="rules" rules={resource.spec.rules} />
    ) : null,
  );

  customComponents.push(() => (
    <EventsList
      key="events"
      namespace={props.namespace}
      filter={filterByResource('Ingress', props.resourceName)}
      hideInvolvedObjects={true}
    />
  ));

  const statusBadge = resource => {
    calculateTotalPorts(resource);
    calculatePortsWithoutErrors(resource);
    const portsStatus =
      totalPods === 0
        ? 'Information'
        : totalPods === healthyPods
        ? 'Success'
        : 'Error';

    return (
      <StatusBadge
        type={portsStatus}
        tooltipContent={'Healthy Ports'}
      >{`${healthyPods} / ${totalPods}`}</StatusBadge>
    );
  };

  return (
    <ResourceDetails
      customComponents={customComponents}
      description={ResourceDescription}
      createResourceForm={IngressCreate}
      statusBadge={statusBadge}
      customConditionsComponents={[
        {
          header: t('ingresses.labels.load-balancers'),
          value: resource => <IngressStatus resource={resource} />,
        },
      ]}
      {...props}
    />
  );
}

export default IngressDetails;
