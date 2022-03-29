import React from 'react';
import jsyaml from 'js-yaml';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { useTranslation } from 'react-i18next';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';

function CustomResource({ params }) {
  const { t, i18n } = useTranslation();

  const { namespaceId: namespace } = useMicrofrontendContext();
  const {
    customResourceDefinitionName,
    resourceVersion,
    resourceName,
  } = params;
  const { data, loading } = useGet(
    `/apis/apiextensions.k8s.io/v1/customresourcedefinitions/${customResourceDefinitionName}`,
    {
      pollingInterval: null,
    },
  );

  if (loading) return <Spinner />;

  const versions = data?.spec?.versions;
  const version =
    versions?.find(version => version.name === resourceVersion) ||
    versions?.find(version => version.storage);

  const crdName = customResourceDefinitionName.split('.')[0];
  const crdGroup = customResourceDefinitionName.replace(`${crdName}.`, '');
  const resourceUrl = `/apis/${crdGroup}/${version.name}/${
    namespace ? `namespaces/${namespace}/` : ''
  }${crdName}/${resourceName}`;

  const breadcrumbs = [
    {
      name: t('custom-resources.title'),
      path: '/',
      fromContext: 'customresources',
    },
    {
      name: customResourceDefinitionName,
      path: '/',
      fromContext: 'customresourcedefinition',
    },
    { name: '' },
  ];

  const yamlPreview = resource => (
    <ReadonlyEditorPanel
      title="YAML"
      value={jsyaml.dump(resource)}
      editorProps={{ language: 'yaml', height: '500px' }}
    />
  );

  return (
    <ResourceDetails
      resourceUrl={resourceUrl}
      resourceType={crdName}
      resourceName={resourceName}
      namespace={namespace}
      breadcrumbs={breadcrumbs}
      customComponents={[yamlPreview]}
      i18n={i18n}
    />
  );
}
export default CustomResource;
