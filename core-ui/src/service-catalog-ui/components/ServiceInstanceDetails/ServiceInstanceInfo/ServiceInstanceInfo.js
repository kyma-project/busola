import React from 'react';
import LuigiClient from '@luigi-project/client';
import { PageHeader } from 'shared/components/PageHeader/PageHeader';
import { ExternalLink } from 'shared/components/Link/ExternalLink';
import { getResourceDisplayName } from 'helpers';
import { serviceInstanceConstants } from 'helpers/constants';
import { ServiceInstanceStatus } from '../../../shared/ServiceInstanceStatus.js';
import InstanceParametersModal from './InstanceParametersModal';

const ServiceInstanceInfo = ({
  serviceInstance,
  serviceClass,
  servicePlan,
  i18n,
}) => {
  const goToServiceClassDetails = name => {
    const target = `catalog/${serviceClass.kind}/${name}`;
    LuigiClient.linkManager()
      .fromContext('namespace')
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

  const documentationLink = serviceClass.spec.externalMetadata
    ?.documentationUrl && (
    <ExternalLink
      className="fd-link"
      url={serviceClass.spec.externalMetadata.documentationUrl}
      text={serviceInstanceConstants.link}
      data-e2e-id="instance-service-documentation-link"
    />
  );

  const supportLink = serviceClass.spec.externalMetadata?.supportUrl && (
    <ExternalLink
      className="fd-link"
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
              i18n={i18n}
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
    </>
  );
};

export default ServiceInstanceInfo;
