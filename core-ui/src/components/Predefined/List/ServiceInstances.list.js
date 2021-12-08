import React from 'react';
import { useTranslation } from 'react-i18next';
import { BTPResourceStatus } from 'shared/components/BTPResourceStatus';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

export const ServiceInstancesList = ({ DefaultRenderer, ...otherParams }) => {
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
    <DefaultRenderer
      customColumns={customColumns}
      resourceName={t('btp-instances.title')}
      textSearchProperties={[
        'spec.serviceOfferingName',
        'spec.servicePlanName',
        'spec.externalName',
      ]}
      description={description}
      {...otherParams}
    />
  );
};
