import jsyaml from 'js-yaml';
import { useRecoilValue } from 'recoil';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import CRCreate from 'resources/CustomResourceDefinitions/CRCreate';
import { useCallback } from 'react';

export default function CustomResource({ params }) {
  const namespace = useRecoilValue(activeNamespaceIdState);
  const {
    customResourceDefinitionName,
    resourceVersion,
    resourceName,
    resourceNamespace,
    isModule,
    headerActions,
  } = params;

  const { data, loading } = useGet(
    `/apis/apiextensions.k8s.io/v1/customresourcedefinitions/${customResourceDefinitionName}`,
    {
      pollingInterval: null,
      skip: !customResourceDefinitionName,
    },
  );

  const CRCreateWrapper = useCallback(
    props => <CRCreate {...props} crd={data} layoutNumber="MidColumn" />,
    [data],
  );

  if (loading) return <Spinner />;

  const versions = data?.spec?.versions;
  const version =
    versions?.find(version => version.name === resourceVersion) ||
    versions?.find(version => version.storage);

  const crdName = customResourceDefinitionName?.split('.')[0];
  const crdGroup = customResourceDefinitionName?.replace(`${crdName}.`, '');
  const resourceUrl = resourceName
    ? `/apis/${crdGroup}/${version?.name}/${
        resourceNamespace
          ? `namespaces/${resourceNamespace}/`
          : namespace
          ? `namespaces/${namespace}/`
          : ''
      }${crdName}/${resourceName}`
    : '';

  const yamlPreview = resource => {
    return Object.keys(resource || {}).map(key => {
      if (typeof resource[key] === 'object' && key !== 'metadata') {
        //&& key !== 'metadata'
        return (
          <ReadonlyEditorPanel
            title={key} //key[0].toLocaleUpperCase() + key.substring(1)
            value={jsyaml.dump(resource[key])}
            key={key + JSON.stringify(resource[key])}
          />
        );
      }
    });
  };

  const yamlSinglePropsPreview = resource => {
    const singleProps = {};
    Object.keys(resource || {}).forEach(key => {
      if (typeof resource[key] !== 'object' && key !== 'metadata') {
        singleProps[key] = resource[key];
      }
    });
    if (Object.keys(singleProps).length > 0) {
      return (
        <ReadonlyEditorPanel
          title="props"
          value={jsyaml.dump(singleProps)}
          key="single-props"
        />
      );
    }
    <ReadonlyEditorPanel
      key="editor"
      title="YAML"
      value={jsyaml.dump(resource)}
    />;
  };

  return (
    <ResourceDetails
      layoutNumber={params.layoutNumber ?? 'EndColumn'}
      resourceUrl={resourceUrl}
      resourceType={crdName}
      resourceName={resourceName}
      namespace={namespace}
      createResourceForm={CRCreateWrapper}
      customComponents={[yamlPreview]}
      layoutCloseCreateUrl={params.layoutCloseCreateUrl}
      disableDelete={isModule}
      headerActions={headerActions}
    />
  );
}
