import React from 'react';
import PropTypes from 'prop-types';
import LuigiClient from '@luigi-project/client';
import { Breadcrumb } from 'fundamental-react';
import ServiceClassToolbar from '../ServiceClassToolbar/ServiceClassToolbar.component';
import ServiceClassInfo from '../ServiceClassInfo/ServiceClassInfo.component';

import {
  BreadcrumbWrapper,
  ServiceClassToolbarWrapper,
  HeaderWrapper,
} from './styled';

import { serviceClassConstants } from 'helpers/constants';
import { isService } from 'helpers';

const ServiceClassDetailsHeader = ({
  creationTimestamp,
  description,
  documentationUrl,
  imageUrl,
  isProvisionedOnlyOnce,
  labels,
  providerDisplayName,
  serviceClassDisplayName,
  supportUrl,
  tags,
  children,
  serviceClassName,
  isAPIpackage,
  planSelector,
  plansCount,
}) => {
  const goToList = () => {
    LuigiClient.linkManager()
      .fromClosestContext()
      .withParams({
        selectedTab: isService({ labels }) ? 'services' : 'addons',
      })
      .navigate('/');
  };
  const goToPlansList = serviceClassName => {
    return LuigiClient.linkManager()
      .fromClosestContext()
      .navigate(`details/${serviceClassName}/plans`);
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
          {isAPIpackage && serviceClassName && plansCount > 1 && (
            <Breadcrumb.Item
              name={`${serviceClassDisplayName} - Plans list`}
              url="#"
              onClick={() => goToPlansList(serviceClassName)}
            />
          )}
          <Breadcrumb.Item />
        </Breadcrumb>
      </BreadcrumbWrapper>
      <ServiceClassToolbarWrapper>
        <ServiceClassToolbar
          serviceClassDisplayName={serviceClassDisplayName}
          providerDisplayName={providerDisplayName}
        >
          {children}
        </ServiceClassToolbar>
      </ServiceClassToolbarWrapper>
      <ServiceClassInfo
        creationTimestamp={creationTimestamp}
        description={description}
        documentationUrl={documentationUrl}
        imageUrl={imageUrl}
        isProvisionedOnlyOnce={isProvisionedOnlyOnce}
        labels={labels}
        providerDisplayName={providerDisplayName}
        supportUrl={supportUrl}
        tags={tags}
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
