import React from 'react';
import { useTranslation } from 'react-i18next';
import { ComponentForList } from 'shared/getComponents';

export const ServiceAccountsDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('cron-jobs.last-schedule-time'),
      value: resource => console.log(resource),
    },
  ];

  const SAdetails = serviceAccount => {
    const namespace = serviceAccount.metadata.namespace;
    const serviceAccountsUrl = `/api/v1/namespaces/${namespace}/secrets`;

    const filterBySecret = secret =>
      serviceAccount.secrets.find(
        ({ name: secretName }) => secret.metadata.name === secretName,
      );

    return (
      <ComponentForList
        name="serviceAccountList"
        key="service-account-details"
        params={{
          hasDetailsView: true,
          fixedPath: true,
          resourceUrl: serviceAccountsUrl,
          resourceType: 'serviceaccounts',
          namespace,
          isCompact: true,
          showTitle: true,
          filter: filterBySecret,
        }}
      />
    );
  };

  return (
    <>
      <DefaultRenderer
        customComponents={[SAdetails]}
        customColumns={customColumns}
        {...otherParams}
      />
    </>
  );
};
