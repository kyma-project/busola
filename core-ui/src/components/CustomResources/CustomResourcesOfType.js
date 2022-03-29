import React from 'react';
import LuigiClient from '@luigi-project/client';
import pluralize from 'pluralize';
import { useTranslation } from 'react-i18next';
import { useGet, PageHeader } from 'react-shared';
import { CustomResources } from 'components/CustomResources/CustomResources';
import { LayoutPanel, Link } from 'fundamental-react';
import { Spinner } from 'react-shared/';

export default function CustomResourcesOfType({ crdName, namespace }) {
  const { t, i18n } = useTranslation();
  const { data: crd, loading, error } = useGet(
    `/apis/apiextensions.k8s.io/v1/customresourcedefinitions/` + crdName,
  );

  if (loading) return <Spinner />;
  if (error) {
    return (
      <LayoutPanel className="fd-has-padding-regular fd-margin--md">
        {error.message}
      </LayoutPanel>
    );
  }

  const breadcrumbItems = [
    {
      name: t('custom-resources.title'),
      fromContext: 'customresources',
      path: '/',
    },
    { name: '' },
  ];

  const navigateToCRD = () =>
    LuigiClient.linkManager()
      .fromContext('cluster')
      .navigate(`customresourcedefinitions/details/${crd.metadata.name}`);

  return (
    <>
      <PageHeader
        title={pluralize(crd.spec.names.kind)}
        breadcrumbItems={breadcrumbItems}
      >
        <PageHeader.Column
          title={t('custom-resource-definitions.name_singular')}
        >
          <Link className="fd-link" onClick={navigateToCRD}>
            {crd.metadata.name}
          </Link>
        </PageHeader.Column>
      </PageHeader>
      <CustomResources
        namespace={namespace}
        crd={crd}
        version={crd.spec.versions.find(v => v.served)}
        i18n={i18n}
        showTitle={false}
        showNamespace={false}
      />
    </>
  );
}
