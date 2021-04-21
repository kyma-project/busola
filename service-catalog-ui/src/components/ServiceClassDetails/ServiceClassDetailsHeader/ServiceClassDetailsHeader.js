import React from 'react';
import PropTypes from 'prop-types';
import LuigiClient from '@luigi-project/client';
import ServiceClassInfo from '../ServiceClassInfo/ServiceClassInfo';
import { PageHeader } from 'react-shared';

import { serviceClassConstants } from 'helpers/constants';
import { isService, getResourceDisplayName } from 'helpers';

const ServiceClassDetailsHeader = ({ serviceClass, children }) => {
  const labels = {
    ...(serviceClass.spec.externalMetadata?.labels || []),
    ...(serviceClass.metadata.labels || []),
  };

  const goToList = () => {
    LuigiClient.linkManager()
      .fromClosestContext()
      .withParams({
        selectedTab: isService(labels) ? 'services' : 'addons',
      })
      .navigate('/');
  };

  return (
    <PageHeader
      title={getResourceDisplayName(serviceClass)}
      description={serviceClass.spec.externalMetadata?.providerDisplayName}
      breadcrumbItems={[
        {
          name: `${serviceClassConstants.title} - ${
            isService(labels) ? 'Services' : 'Add-Ons'
          }`,
          path: '/',
          onClick: goToList,
        },
        { name: '' },
      ]}
      actions={[children]}
    >
      <ServiceClassInfo serviceClass={serviceClass} labels={labels} />
    </PageHeader>
  );
};

ServiceClassDetailsHeader.propTypes = {
  serviceClass: PropTypes.object.isRequired,
};

export default ServiceClassDetailsHeader;
