import React from 'react';
import { Link } from 'react-router-dom';
import pluralize from 'pluralize';
import { useTranslation } from 'react-i18next';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { PageHeader } from 'shared/components/PageHeader/PageHeader';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { CustomResources } from 'components/CustomResources/CustomResources';
import { useUrl } from 'hooks/useUrl';
import YamlUploadDialog from 'resources/Namespaces/YamlUpload/YamlUploadDialog';
import { useRecoilState } from 'recoil';
import { showYamlUploadDialogState } from 'state/showYamlUploadDialogAtom';
import { Panel } from '@ui5/webcomponents-react';

export default function CustomResourcesOfType({ crdName }) {
  const { t } = useTranslation();
  const { clusterUrl } = useUrl();
  const [showAdd, setShowAdd] = useRecoilState(showYamlUploadDialogState);
  const { data: crd, loading, error } = useGet(
    `/apis/apiextensions.k8s.io/v1/customresourcedefinitions/` + crdName,
  );

  if (loading) return <Spinner />;
  if (error) {
    return (
      <Panel fixed className="fd-has-padding-regular fd-margin--md">
        {error.message}
      </Panel>
    );
  }

  const breadcrumbItems = [
    {
      name: t('custom-resources.title'),
      url: clusterUrl('customresources'),
    },
    { name: '' },
  ];

  return (
    <>
      <PageHeader
        title={pluralize(crd.spec.names.kind)}
        breadcrumbItems={breadcrumbItems}
      >
        <PageHeader.Column
          title={t('custom-resource-definitions.name_singular')}
        >
          <Link
            className="fd-link"
            to={clusterUrl(`customresourcedefinitions/${crd.metadata.name}`)}
          >
            {crd.metadata.name}
          </Link>
        </PageHeader.Column>
      </PageHeader>
      <CustomResources
        crd={crd}
        version={crd.spec.versions.find(v => v.served)}
        showTitle={false}
        showNamespace={false}
      />
      <YamlUploadDialog
        show={showAdd}
        onCancel={() => {
          setShowAdd(false);
        }}
      />
    </>
  );
}
