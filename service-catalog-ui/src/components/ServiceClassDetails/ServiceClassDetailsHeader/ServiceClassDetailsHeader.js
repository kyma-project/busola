import React from 'react';
import PropTypes from 'prop-types';
import LuigiClient from '@luigi-project/client';
import { Breadcrumb } from 'fundamental-react';
import ServiceClassToolbar from '../ServiceClassToolbar/ServiceClassToolbar';
import ServiceClassInfo from '../ServiceClassInfo/ServiceClassInfo';

import {
  BreadcrumbWrapper,
  ServiceClassToolbarWrapper,
  HeaderWrapper,
} from './styled';

import { serviceClassConstants } from 'helpers/constants';
import { isService, getResourceDisplayName } from 'helpers';

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
          // providerDisplayName={serviceClass.} //TODO
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
  serviceClass: PropTypes.object.isRequired,
  planSelector: PropTypes.node,
};

export default ServiceClassDetailsHeader;
