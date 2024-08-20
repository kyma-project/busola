import { useTranslation } from 'react-i18next';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

import { Rules } from './Rules';
import { DefaultBackendPanel } from './DefaultBackendPanel';
import IngressCreate from './IngressCreate';
import { ResourceDescription } from 'resources/Ingresses';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

const exampleStatus = {
  loadBalancer: {
    ingress: [
      {
        hostname: 'example-lb1.example.com',
        ip: '192.0.2.1',
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
        hostname: 'example-lb2.example.com',
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

  const getLoadBalancer = ingress => {
    ingress.status = exampleStatus;
    if (ingress.status.loadBalancer?.ingress) {
      return ingress.status.loadBalancer?.ingress
        .map(endpoint => endpoint.ip || endpoint.hostname)
        .join(', ');
    } else {
      return EMPTY_TEXT_PLACEHOLDER;
    }
  };

  const calculateTotalPorts = ingress => {
    //ingress.status = exampleStatus;

    const totalPorts =
      ingress?.status?.loadBalancer?.ingress?.reduce((total, endpoint) => {
        return total + (endpoint?.ports ? endpoint?.ports?.length : 0);
      }, 0) ?? 0;

    return totalPorts;
  };

  const calculatePortsWithoutErrors = ingress => {
    //ingress.status = exampleStatus;

    const totalPortsWithoutErrors =
      ingress?.status?.loadBalancer?.ingress?.reduce((total, endpoint) => {
        return (
          total +
          (endpoint?.ports
            ? endpoint?.ports.filter(port => !port?.error)?.length
            : 0)
        );
      }, 0) ?? 0;

    return totalPortsWithoutErrors;
  };

  const customColumns = [];

  const customComponents = [];

  customComponents.push(resource => (
    <UI5Panel title={'Specification'}>
      {resource.spec.ingressClassName && (
        <LayoutPanelRow
          name={t('ingresses.labels.ingress-class-name')}
          value={resource.spec.ingressClassName}
        />
      )}
    </UI5Panel>
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

  const customStatusColumns = [
    {
      header: t('ingresses.labels.load-balancers'),
      value: getLoadBalancer,
    },
    {
      header: 'Ports',
      value: resource => calculateTotalPorts(resource),
    },
  ];

  const statusBadge = resource => {
    const portsNoError = calculatePortsWithoutErrors(resource);
    const allPorts = calculateTotalPorts(resource);
    const portsStatus =
      allPorts === 0
        ? 'Information'
        : allPorts === portsNoError
        ? 'Success'
        : 'Error';

    return (
      <StatusBadge
        type={portsStatus}
        tooltipContent={'Healthy Ports'}
      >{`${portsNoError} / ${allPorts}`}</StatusBadge>
    );
  };

  return (
    <ResourceDetails
      customColumns={customColumns}
      customComponents={customComponents}
      customStatusColumns={customStatusColumns}
      description={ResourceDescription}
      createResourceForm={IngressCreate}
      statusBadge={statusBadge}
      {...props}
    />
  );
}

export default IngressDetails;
