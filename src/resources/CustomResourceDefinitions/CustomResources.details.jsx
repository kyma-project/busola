import jsyaml from 'js-yaml';
import { useAtomValue } from 'jotai';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';
import CRCreate from 'resources/CustomResourceDefinitions/CRCreate';

export default function CustomResource({ params }) {
  const { t } = useTranslation();
  const namespace = useAtomValue(activeNamespaceIdAtom);
  const {
    customResourceDefinitionName,
    resourceVersion,
    resourceName,
    resourceNamespace,
    isModule,
    isEntireListProtected,
    setResMetadata,
    headerActions,
  } = params;

  const { data, loading } = useGet(
    `/apis/apiextensions.k8s.io/v1/customresourcedefinitions/${customResourceDefinitionName}`,
    {
      pollingInterval: null,
      skip: !customResourceDefinitionName,
    },
  );

  const selectedVersion = useMemo(() => {
    if (!data?.spec?.versions) return null;
    const versions = data.spec.versions;
    return (
      versions.find((version) => version.name === resourceVersion) ||
      versions.find((version) => version.storage)
    );
  }, [data?.spec?.versions, resourceVersion]);

  useEffect(() => {
    if (isModule && setResMetadata && data?.spec && selectedVersion) {
      setResMetadata({
        group: data.spec.group,
        version: selectedVersion.name,
        kind: data.spec.names?.kind,
      });
    }
  }, [data, isModule, setResMetadata, selectedVersion]);

  const CRCreateWrapper = useCallback(
    (props) => <CRCreate {...props} crd={data} layoutNumber="midColumn" />,
    [data],
  );

  if (loading) return <Spinner />;

  const crdName = customResourceDefinitionName?.split('.')[0];
  const crdGroup = customResourceDefinitionName?.replace(`${crdName}.`, '');
  const resourceUrl =
    resourceName && crdGroup && selectedVersion?.name && crdName
      ? `/apis/${crdGroup}/${selectedVersion?.name}/${
          resourceNamespace
            ? `namespaces/${resourceNamespace}/`
            : namespace
              ? `namespaces/${namespace}/`
              : ''
        }${crdName}/${resourceName}`
      : '';

  const customColumns = [
    {
      header: t('custom-resources.headers.api-version'),
      value: (resource) => resource.apiVersion,
    },
  ];
  const yamlPreview = (resource) => {
    return Object.keys(resource || {})
      ?.map((key) => {
        if (typeof resource[key] === 'object' && key !== 'metadata') {
          return (
            <ReadonlyEditorPanel
              title={key}
              value={jsyaml.dump(resource[key])}
              key={key + JSON.stringify(resource[key])}
            />
          );
        }
        return null;
      })
      .filter(Boolean);
  };

  return (
    <ResourceDetails
      layoutNumber={params.layoutNumber ?? 'endColumn'}
      resourceUrl={resourceUrl}
      resourceType={crdName}
      resourceName={resourceName}
      namespace={namespace}
      customColumns={customColumns}
      createResourceForm={CRCreateWrapper}
      customComponents={[yamlPreview]}
      layoutCloseCreateUrl={params.layoutCloseCreateUrl}
      disableDelete={isModule}
      isEntireListProtected={isEntireListProtected}
      headerActions={headerActions}
      windowTitle={isModule ? t('kyma-modules.title') : null}
    />
  );
}
