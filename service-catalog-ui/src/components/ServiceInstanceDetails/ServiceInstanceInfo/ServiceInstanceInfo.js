import React from 'react';
import LuigiClient from '@luigi-project/client';
import { getResourceDisplayName } from 'helpers';
import {
  serviceInstanceConstants,
  DOCUMENTATION_PER_PLAN_LABEL,
} from 'helpers/constants';

import { Token } from 'fundamental-react';
import { Link, PageHeader } from 'react-shared';
import './ServiceInstanceInfo.scss';

import { ServiceInstanceStatus } from '../../../shared/ServiceInstanceStatus.js';
import InstanceParametersModal from './InstanceParametersModal';

const ServiceInstanceInfo = ({
  serviceInstance,
  serviceClass,
  servicePlan,
}) => {
  // const serviceClassDocsPerPlan =
  //   serviceInstance?.serviceClass?.labels[DOCUMENTATION_PER_PLAN_LABEL] ===
  //   'true';
  console.log(serviceClass);

  const goToServiceClassDetails = name => {
    const target = `catalog/details/${name}`;
    LuigiClient.linkManager()
      .fromContext('namespaces')
      .withParams({
        resourceType: serviceClass.kind,
      })
      .navigate(target);
  };

  if (!serviceInstance) {
    return null;
  }

  const classContent = (
    <button
      className="link has-padding-0 fd-has-type-0"
      data-e2e-id="instance-service-class"
      onClick={() => goToServiceClassDetails(serviceClass.metadata.name)}
    >
      {getResourceDisplayName(serviceClass)}
    </button>
  );

  //TODO: decide what to do with those labels.
  // const hasLabels = Object.keys(
  //   serviceClass.spec.externalMetadata?.labels || [],
  // ).length;

  // const labels = (
  //   <ul className="no-dismiss-tokens labels-list" data-e2e-id="instance-labels">
  //     {Object.keys(serviceClass.spec.externalMetadata?.labels || []).map(
  //       key => (
  //         <Token key={key}>{key}</Token>
  //       ),
  //     )}
  //   </ul>
  // );

  const documentationLink = serviceClass.spec.externalMetadata
    ?.documentationUrl && (
    <Link
      url={serviceClass.spec.externalMetadata.documentationUrl}
      text={serviceInstanceConstants.link}
      data-e2e-id="instance-service-documentation-link"
    />
  );

  const supportLink = serviceClass.spec.externalMetadata?.supportUrl && (
    <Link
      url={serviceClass.spec.externalMetadata.supportUrl}
      text={serviceInstanceConstants.link}
      data-e2e-id="instance-service-support-link"
    />
  );

  const Column = PageHeader.Column;
  return (
    <>
      <Column title={serviceInstanceConstants.statusHeader}>
        <ServiceInstanceStatus instance={serviceInstance} />
      </Column>
      <Column title={serviceInstanceConstants.classHeader}>
        {classContent}
      </Column>
      <Column title={serviceInstanceConstants.planHeader}>
        <div data-e2e-id="instance-service-plan">
          {
            <InstanceParametersModal
              servicePlan={servicePlan}
              parameters={serviceInstance.spec.parameters}
            />
          }
        </div>
      </Column>
      {documentationLink && (
        <Column title={serviceInstanceConstants.documentationHeader}>
          {documentationLink}
        </Column>
      )}
      {supportLink && (
        <Column title={serviceInstanceConstants.supportHeader}>
          {supportLink}
        </Column>
      )}
      {/* {hasLabels && (
        <Column title={serviceInstanceConstants.labelsHeader}>{labels}</Column>
      )} */}
    </>
  );
};

export default ServiceInstanceInfo;
