import React from 'react';
import PropTypes from 'prop-types';
import LuigiClient from '@luigi-project/client';
import { Breadcrumb } from 'fundamental-react';
import ServiceClassToolbar from '../ServiceClassToolbar/ServiceClassToolbar.component';
import ServiceClassInfo from '../ServiceClassInfo/ServiceClassInfo';

import {
  BreadcrumbWrapper,
  ServiceClassToolbarWrapper,
  HeaderWrapper,
} from './styled';

import { serviceClassConstants } from 'helpers/constants';
import {
  isService,
  isStringValueEqualToTrue,
  getResourceDisplayName,
} from 'helpers';
//  serviceClassDisplayName={serviceClassDisplayName}
//         providerDisplayName={
//           serviceClass.spec.externalMetadata?.providerDisplayName
//         }
//         creationTimestamp={serviceClass.metadata.creationTimestamp}
//         documentationUrl={documentationUrl}
//         supportUrl={supportUrl}
//         imageUrl={imageUrl}
//         tags={serviceClass.spec.tags}
//         labels={labels}
//         description={getDescription(serviceClass)}
//         isProvisionedOnlyOnce={isProvisionedOnlyOnce}
//         serviceClassName={name}
const ServiceClassDetailsHeader = ({
  serviceClass,
  children,
  planSelector,
}) => {
  const labels = {
    ...(serviceClass.spec.externalMetadata?.labels || []),
    ...(serviceClass.metadata.labels || []),
  };

  const goToList = () => {
    LuigiClient.linkManager()
      .fromClosestContext()
      .withParams({
        selectedTab: isService({ labels }) ? 'services' : 'addons',
      })
      .navigate('/');
  };

  return (
    <HeaderWrapper>
      <BreadcrumbWrapper>
        <Breadcrumb>
          <Breadcrumb.Item
            name={`${serviceClassConstants.title} - ${
              isService(labels) ? 'Services' : 'Add-Ons'
            }`}
            url="#"
            onClick={goToList}
          />

          <Breadcrumb.Item />
        </Breadcrumb>
      </BreadcrumbWrapper>
      <ServiceClassToolbarWrapper>
        <ServiceClassToolbar
          serviceClassDisplayName={getResourceDisplayName(serviceClass)}
          // providerDisplayName={providerDisplayName} TODO
        >
          {children}
        </ServiceClassToolbar>
      </ServiceClassToolbarWrapper>
      <ServiceClassInfo
        serviceClass={serviceClass}
        labels={labels}
        planSelector={planSelector}
      />
    </HeaderWrapper>
  );
};

ServiceClassDetailsHeader.propTypes = {
  creationTimestamp: PropTypes.string.isRequired,
  description: PropTypes.string,
  serviceClassDisplayName: PropTypes.string.isRequired,
  providerDisplayName: PropTypes.string,
  children: PropTypes.node,
  labels: PropTypes.object,
  tags: PropTypes.array,
  documentationUrl: PropTypes.string,
  imageUrl: PropTypes.string,
  supportUrl: PropTypes.string,
  serviceClassName: PropTypes.string,
  isAPIpackage: PropTypes.bool,
  planSelector: PropTypes.node,
};

export default ServiceClassDetailsHeader;
