import React from 'react';
import jsyaml from 'js-yaml';

import {
  ResourceDetails,
  useGet,
  Spinner,
  useMicrofrontendContext,
} from 'react-shared';
import { useTranslation } from 'react-i18next';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';

export function CustomResource({ params }) {
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

  const SchemaPreview = resource => (
    <ReadonlyEditorPanel
      title={t('custom-resources.schema-preview')}
      value={jsyaml.dump(resource)}
    />
  );

  return (
    <ResourceDetails
      resourceUrl={resourceUrl}
      resourceType={crdName}
      resourceName={resourceName}
      namespace={namespace}
      breadcrumbs={breadcrumbs}
      customComponents={[SchemaPreview]}
      i18n={i18n}
    />
  );
}
