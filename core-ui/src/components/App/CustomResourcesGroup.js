import React from 'react';
import LuigiClient from '@luigi-project/client';
import pluralize from 'pluralize';
import { useTranslation } from 'react-i18next';
import { useGet, PageHeader } from 'react-shared';
import { CustomResources } from 'components/Predefined/Details/CustomResourceDefinitions/CustomResources';
import { Link } from 'fundamental-react';

export function CustomResourcesGroup({ crdName, namespace }) {
  const { t, i18n } = useTranslation();
  const { data: crd, loading, error } = useGet(
    `/apis/apiextensions.k8s.io/v1/customresourcedefinitions/` + crdName,
  );

  if (!crd) return null;

  const version = crd.spec.versions.find(v => v.served);
  const breadcrumbItems = [
    {
      name: t('custom-resources.title'),
      fromContext: 'customresources',
      path: '/',
    },
    { name: '' },
  ];

  const navigateToCRD = () =>
    LuigiClient.linkManager() //todo
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
        version={version}
        i18n={i18n}
        showTitle={false}
      />
    </>
  );
}
