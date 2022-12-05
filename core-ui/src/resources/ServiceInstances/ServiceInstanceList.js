import React from 'react';
import { useTranslation } from 'react-i18next';
import { BTPResourceStatus } from 'shared/components/BTPResourceStatus';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Link } from 'shared/components/Link/Link';
import { Trans } from 'react-i18next';
import { ServiceInstanceCreate } from './ServiceInstanceCreate';

export function ServiceInstanceList(props) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('btp-instances.offering-name'),
      value: resource => resource.spec.serviceOfferingName,
    },
    {
      header: t('btp-instances.plan-name'),
      value: resource => resource.spec.servicePlanName,
    },
    {
      header: t('btp-instances.external-name'),
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
    <Trans i18nKey="btp-instances.description">
      <Link
        className="fd-link"
        url="https://github.com/SAP/sap-btp-service-operator#step-1-create-a-service-instance"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      resourceTitle={t('btp-instances.title')}
      description={description}
      {...props}
      searchSettings={{
        textSearchProperties: [
          'spec.serviceOfferingName',
          'spec.servicePlanName',
          'spec.externalName',
        ],
      }}
      createResourceForm={ServiceInstanceCreate}
    />
  );
}
export default ServiceInstanceList;
