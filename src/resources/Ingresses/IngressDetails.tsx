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

interface IngressDetailsProps {
  namespace: string;
  resourceName: string;
  [key: string]: any;
}

export function IngressDetails(props: IngressDetailsProps) {
  const { t } = useTranslation();
  const [totalPorts, setTotalPorts] = useState(0);
  const [healthyPorts, setHealthyPorts] = useState(0);

  const calculatePorts = (ingress: any) => {
    let allPorts = 0;
    let healthy = 0;

    ingress?.status?.loadBalancer?.ingress?.forEach((element: any) => {
      element?.ports?.forEach((port: any) => {
        allPorts++;
        if (!port.error) healthy++;
      });
    });

    setTotalPorts(allPorts);
    setHealthyPorts(healthy);
  };

  const customComponents: Array<
    (resource: any, resourceUrl: string) => React.ReactNode
  > = [];

  customComponents.push(
    (resource) =>
      (resource.spec?.ingressClassName || resource.spec?.tls) && (
        <IngressSpecification key="ingress-specification" resource={resource} />
      ),
  );

  customComponents.push((resource) =>
    resource.spec.defaultBackend ? (
      <DefaultBackendPanel
        key="default-backend"
        backend={resource.spec.defaultBackend}
        namespace={resource.metadata.namespace}
      />
    ) : null,
  );
  customComponents.push((resource) =>
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

  const statusBadge = (resource: any) => {
    calculatePorts(resource);
    const portsStatus =
      totalPorts === 0
        ? 'Information'
        : totalPorts === healthyPorts
          ? 'Positive'
          : 'Negative';

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
          value: (resource: any) => <IngressStatus resource={resource} />,
        },
      ]}
      {...(props as any)}
    />
  );
}

export default IngressDetails;
