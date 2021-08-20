import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';
import { Link } from 'fundamental-react';

export const ServiceBindingsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const navigateToInstance = instanceName =>
    LuigiClient.linkManager()
      .fromContext('namespace')
      .navigate(`/btp-instances/details/${instanceName}`);

  const navigateToSecret = secretName =>
    LuigiClient.linkManager()
      .fromContext('namespace')
      .navigate(`/secrets/details/${secretName}`);

  const customColumns = [
    {
      header: 'Instance name',
      value: resource => (
        <Link
          className="fd-link"
          onClick={() => navigateToInstance(resource.spec.serviceInstanceName)}
        >
          {resource.spec.serviceInstanceName}
        </Link>
      ),
    },
    {
      header: 'External name',
      value: resource => resource.spec.externalName,
    },
    {
      header: 'Secret name',
      value: resource => (
        <Link
          className="fd-link"
          onClick={() => navigateToSecret(resource.spec.secretName)}
        >
          {resource.spec.secretName}
        </Link>
      ),
    },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      resourceName={t('btp-service-bindings.title')}
      textSearchProperties={[
        'spec.serviceInstanceName',
        'spec.externalName',
        'spec.secretName',
      ]}
      {...otherParams}
    />
  );
};
