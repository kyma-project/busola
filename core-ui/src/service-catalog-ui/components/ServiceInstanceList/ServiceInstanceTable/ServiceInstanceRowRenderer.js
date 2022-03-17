import React from 'react';
import LuigiClient from '@luigi-project/client';

import { Icon } from 'fundamental-react';
import { Modal } from 'react-shared';
import {
  LinkButton,
  Link,
  ServiceClassButton,
  ServicePlanButton,
  JSONCode,
  TextOverflowWrapper,
} from './styled';

import { ServiceInstanceStatus } from './../../../shared/ServiceInstanceStatus.js';

const goToServiceInstanceDetails = name => {
  LuigiClient.linkManager()
    .fromContext('namespace')
    .navigate(`instances/details/${name}`);
};

const ServiceInstanceName = ({ instance }) => (
  <TextOverflowWrapper>
    <LinkButton data-e2e-id="instance-name">
      <Link
        className="fd-link"
        onClick={() => goToServiceInstanceDetails(instance.metadata.name)}
        data-e2e-id={`instance-name-${instance.name}`}
        title={instance.metadata.name}
      >
        {instance.metadata.name}
      </Link>
    </LinkButton>
  </TextOverflowWrapper>
);

const ServiceClassName = ({ instance }) => {
  const className =
    instance.spec.serviceClassExternalName ||
    instance.spec.clusterServiceClassExternalName;

  const classRef =
    instance.spec.serviceClassRef?.name ||
    instance.spec.clusterServiceClassRef?.name;

  const resourceType = instance.spec.serviceClassRef
    ? 'ServiceClass'
    : 'ClusterServiceClass';

  if (!className) return '-';

  return (
    <TextOverflowWrapper>
      <ServiceClassButton
        onClick={
          classRef
            ? () =>
                LuigiClient.linkManager()
                  .fromContext('namespace')
                  .withParams({
                    resourceType,
                  })
                  .navigate(`catalog/details/${classRef}`)
            : null
        }
        title={className}
      >
        {className}
      </ServiceClassButton>
    </TextOverflowWrapper>
  );
};

const Plan = ({ instance, i18n }) => {
  const planDisplayName =
    instance.spec.servicePlanExternalName ||
    instance.spec.clusterServicePlanExternalName;

  if (!planDisplayName) return '-';

  if (
    instance.spec.parameters &&
    typeof instance.spec.parameters === 'object' &&
    Object.keys(instance.spec.parameters).length
  ) {
    return (
      <TextOverflowWrapper>
        <Modal
          title="Instance's Parameters"
          modalOpeningComponent={
            <ServicePlanButton data-e2e-id="service-plan">
              {planDisplayName}{' '}
              <Icon
                glyph="detail-view"
                size="s"
                ariaLabel="View instance parameters"
              />
            </ServicePlanButton>
          }
          confirmText="Close"
          i18n={i18n}
        >
          <JSONCode data-e2e-id="service-plan-content">
            {JSON.stringify(instance.spec.parameters, null, 2)}
          </JSONCode>
        </Modal>
      </TextOverflowWrapper>
    );
  }
  return (
    <TextOverflowWrapper>
      <span data-e2e-id="service-plan">{planDisplayName}</span>
    </TextOverflowWrapper>
  );
};

export default function renderRow({ instance, i18n }) {
  return [
    <ServiceInstanceName instance={instance} />,
    <ServiceClassName instance={instance} />,
    <Plan instance={instance} i18n={i18n} />,
    <ServiceInstanceStatus instance={instance} />,
  ];
}
