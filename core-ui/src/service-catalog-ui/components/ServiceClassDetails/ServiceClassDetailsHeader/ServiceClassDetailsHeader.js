import React from 'react';
import PropTypes from 'prop-types';
import ServiceClassInfo from '../ServiceClassInfo/ServiceClassInfo';

import { PageHeader } from 'shared/components/PageHeader/PageHeader';

import { serviceClassConstants } from 'helpers/constants';
import { isService, getResourceDisplayName } from 'helpers';

const ServiceClassDetailsHeader = ({ serviceClass, children }) => {
  const labels = {
    ...(serviceClass.spec.externalMetadata?.labels || []),
    ...(serviceClass.metadata.labels || []),
  };

  const breadcrumbItems = [
    {
      name: `${serviceClassConstants.title} - ${
        isService(labels) ? 'Services' : 'Add-Ons'
      }`,
      path: '/',
      params: {
        selectedTab: isService(labels) ? 'services' : 'addons',
      },
    },
    {
      name: '',
    },
  ];

  return (
    <>
      <PageHeader
        title={getResourceDisplayName(serviceClass)}
        description={serviceClass.spec.externalMetadata?.providerDisplayName}
        breadcrumbItems={breadcrumbItems}
        actions={children}
      >
        <ServiceClassInfo serviceClass={serviceClass} labels={labels} />
      </PageHeader>
    </>
  );
};

ServiceClassDetailsHeader.propTypes = {
  serviceClass: PropTypes.object.isRequired,
};

export default ServiceClassDetailsHeader;
