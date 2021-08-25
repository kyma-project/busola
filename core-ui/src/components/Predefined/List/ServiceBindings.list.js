import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';
import { Link } from 'fundamental-react';
import { BTPResourceStatus } from 'shared/components/BTPResourceStatus';
import { CreateServiceBindingModal } from 'components/CreateServiceBindingModal/CreateServiceBindingModal';

export const ServiceBindingsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const navigateToInstance = instanceName =>
    LuigiClient.linkManager()
      .fromContext('namespace')
      .navigate(`/btp-instances/details/${instanceName}`);

  const customColumns = [
    {
      header: t('btp-service-bindings.instance-name'),
      value: resource => (
        <Link
          className="fd-link"
          onClick={() => navigateToInstance(resource.spec.serviceInstanceName)}
        >
          {resource.spec.serviceInstanceName}
        </Link>
      ),
      id: 'service-instance-name',
    },
    {
      header: t('btp-service-bindings.external-name'),
      value: resource => resource.spec.externalName,
    },
    {
      header: t('common.headers.status'),
      value: resource => <BTPResourceStatus status={resource.status} />,
    },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      resourceName={t('btp-service-bindings.title')}
      textSearchProperties={['spec.serviceInstanceName', 'spec.externalName']}
      listHeaderActions={
        <CreateServiceBindingModal namespaceId={otherParams.namespace} />
      }
      {...otherParams}
    />
  );
};
