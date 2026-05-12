import jsyaml from 'js-yaml';
import { useAtomValue } from 'jotai';
import { ReactNode, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  CreateResourceFormProps,
  ResourceDetails,
} from 'shared/components/ResourceDetails/ResourceDetails';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';
import CRCreate, { CRD } from 'resources/CustomResourceDefinitions/CRCreate';

type CustomResourceProps = {
  customResourceDefinitionName: string;
  resourceVersion?: string;
  resourceName?: string;
  resourceNamespace?: string;
  isModule?: boolean;
  isEntireListProtected?: boolean;
  setResMetadata?: (metadata: {
    group?: string;
    version?: string;
    kind?: string;
  }) => void;
  headerActions?: ReactNode[];
  layoutNumber?: 'midColumn' | 'endColumn';
  layoutCloseCreateUrl?: string;
};

export default function CustomResource({
  params,
}: {
  params: CustomResourceProps;
}) {
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
    layoutNumber,
    layoutCloseCreateUrl,
  } = params;

  const { data, loading } = useGet(
    `/apis/apiextensions.k8s.io/v1/customresourcedefinitions/${customResourceDefinitionName}`,
    {
      pollingInterval: null,
      skip: !customResourceDefinitionName,
    } as any,
  ) as { data: CRD | null; loading: boolean };

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
    (props: CreateResourceFormProps) => (
      <CRCreate {...props} crd={data ?? undefined} layoutNumber="midColumn" />
    ),
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
      value: (resource: Record<string, any>) => resource.apiVersion,
    },
  ];
  const yamlPreview = (resource: Record<string, any>) => {
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
      layoutNumber={layoutNumber ?? 'endColumn'}
      resourceUrl={resourceUrl}
      resourceType={crdName}
      resourceName={resourceName}
      namespace={namespace}
      customColumns={customColumns}
      createResourceForm={CRCreateWrapper}
      customComponents={[yamlPreview]}
      layoutCloseCreateUrl={layoutCloseCreateUrl}
      disableDelete={isModule}
      isEntireListProtected={isEntireListProtected}
      headerActions={headerActions}
      windowTitle={isModule ? t('kyma-modules.title') : undefined}
    />
  );
}
