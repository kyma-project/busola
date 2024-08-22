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
import { useState } from 'react';

export function IngressDetails(props) {
  const { t } = useTranslation();
  const [totalPorts, setTotalPorts] = useState(0);
  const [healthyPorts, setHealthyPorts] = useState(0);

  const calculatePorts = ingress => {
    let allPorts = 0;
    let healthyPorts = 0;

    ingress?.status?.loadBalancer?.ingress?.forEach(element => {
      element?.ports?.forEach(port => {
        allPorts++;
        if (!port.error) healthyPorts++;
      });
    });

    setTotalPorts(allPorts);
    setHealthyPorts(healthyPorts);
  };

  const customComponents = [];

  customComponents.push(
    resource =>
      (resource.spec?.ingressClassName || resource.spec?.tls) && (
        <IngressSpecification resource={resource} />
      ),
  );

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
    calculatePorts(resource);
    const portsStatus =
      totalPorts === 0
        ? 'Information'
        : totalPorts === healthyPorts
        ? 'Success'
        : 'Error';

    return (
      <StatusBadge
        type={portsStatus}
        tooltipContent={'Healthy Ports'}
      >{`${healthyPorts} / ${totalPorts}`}</StatusBadge>
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
