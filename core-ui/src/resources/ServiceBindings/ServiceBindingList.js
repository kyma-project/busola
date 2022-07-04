import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useTranslation, Trans } from 'react-i18next';
import { Link } from 'fundamental-react';

import { BTPResourceStatus } from 'shared/components/BTPResourceStatus';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledByKind } from 'shared/components/ControlledBy/ControlledBy';
import { Link as ReactSharedLink } from 'shared/components/Link/Link';

import { ServiceBindingCreate } from './ServiceBindingCreate';

export function ServiceBindingList(props) {
  const { t } = useTranslation();

  const navigateToInstance = instanceName =>
    LuigiClient.linkManager()
      .fromContext('namespace')
      .navigate(`/serviceinstances/details/${instanceName}`);

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: resource => (
        <ControlledByKind ownerReferences={resource.metadata.ownerReferences} />
      ),
    },
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
      value: resource => (
        <BTPResourceStatus
          status={resource.status}
          resourceKind="btp-instances"
        />
      ),
    },
  ];

  const description = (
    <Trans i18nKey="btp-service-bindings.description">
      <ReactSharedLink
        className="fd-link"
        url="https://github.com/SAP/sap-btp-service-operator#step-2-create-a-service-binding"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      resourceName={t('btp-service-bindings.title')}
      textSearchProperties={['spec.serviceInstanceName', 'spec.externalName']}
      description={description}
      createResourceForm={ServiceBindingCreate}
      {...props}
    />
  );
}
export default ServiceBindingList;
