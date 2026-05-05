import { FormEventHandler, RefObject } from 'react';
import jp from 'jsonpath';
import pluralize from 'pluralize';

import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useCustomResourceUrl } from 'resources/CustomResourceDefinitions/useCustomResourceUrl';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import CRCreate, { CRD } from 'resources/CustomResourceDefinitions/CRCreate';
import { useUrl } from 'hooks/useUrl';
import { extractApiGroupVersion } from 'resources/Roles/helpers';
import { LayoutColumnName } from 'types';

export type Version = {
  name?: string;
  served?: boolean;
  storage?: boolean;
  schema?: Record<string, any>;
  additionalPrinterColumns?: { name?: string; jsonPath?: string }[];
};

type CustomResourcesProps = {
  crd: CRD;
  version: Version;
  showTitle?: boolean;
  omitColumnsIds?: string[];
  disableCreate?: boolean;
  enableColumnLayout?: boolean;
  layoutCloseCreateUrl?: string;
  simpleEmptyListMessage?: boolean;
};

export function CustomResources({
  crd,
  version,
  showTitle = true,
  omitColumnsIds,
  disableCreate,
  enableColumnLayout,
  layoutCloseCreateUrl,
  simpleEmptyListMessage = false,
}: CustomResourcesProps) {
  const { group, names } = crd.spec;
  const name = names.plural;
  const customUrl = useCustomResourceUrl(crd);
  const { namespace } = useUrl();

  if (!group || !version.name) {
    return null;
  }

  const resourceUrl =
    namespace && namespace !== '-all-'
      ? `/apis/${group}/${version.name}/namespaces/${namespace}/${name}`
      : `/apis/${group}/${version.name}/${name}`;

  const getJsonPath = (resource: Record<string, any>, jsonPath: string) => {
    // try catch to parse annotations to take value from resource using jsonpath
    let value;
    try {
      value =
        jp.value(
          resource,
          jsonPath.includes('annotations.')
            ? `${jsonPath
                .substring(1)
                .replace('annotations.', 'annotations["')
                .replace('\\.', '.')}"]`
            : jsonPath.substring(1),
        ) || EMPTY_TEXT_PLACEHOLDER;
    } catch (e) {
      console.error(e);
      value = (e as Error)?.message;
    }
    if (typeof value === 'boolean') {
      return value.toString();
    } else if (typeof value === 'object') {
      return JSON.stringify(value);
    } else {
      return value;
    }
  };

  const customColumns = version.additionalPrinterColumns?.map((column) => ({
    header: column.name,
    value: (resource: Record<string, any>) =>
      getJsonPath(resource, column.jsonPath ?? ''),
  }));
  // CRD can have infinite number of additionalPrinterColumns what would be impossible to fit into the table
  if (customColumns?.length && customColumns?.length > 5)
    customColumns.length = 5;

  const customColumnLayout = (resource?: {
    metadata?: { name?: string; namespace?: string };
  }) => {
    const { group, version } = extractApiGroupVersion(crd?.apiVersion);
    return {
      resourceName: resource?.metadata?.name,
      resourceType: crd?.metadata?.name,
      namespaceId: resource?.metadata?.namespace,
      apiGroup: group,
      apiVersion: version,
    };
  };

  const params = {
    hasDetailsView: true,
    customUrl,
    resourceUrl,
    title: pluralize(crd.spec.names.kind),
    resourceType: crd.spec.names.kind,
    isCompact: true,
    showTitle,
    customColumns,
    testid: 'crd-custom-resources',
    omitColumnsIds,
    disableCreate,
    createResourceForm: (props: {
      [x: string]: any;
      onChange: FormEventHandler<HTMLElement>;
      formElementRef: RefObject<HTMLFormElement>;
      layoutNumber: LayoutColumnName;
      resource: any;
    }) => <CRCreate {...props} crd={crd} layoutNumber="midColumn" />,
    resourceUrlPrefix: `/apis/${group}/${version.name}`,
    searchSettings: {
      textSearchProperties: ['metadata.namespace'],
      allowSlashShortcut: true,
    },
    namespace,
    enableColumnLayout: enableColumnLayout,
    layoutCloseCreateUrl: layoutCloseCreateUrl,
    columnLayout: 'ThreeColumnsEndExpanded',
    customColumnLayout,
    layoutNumber: 'midColumn' as LayoutColumnName,
    parentCrdName: crd.metadata.name,
    simpleEmptyListMessage,
  };
  return <ResourcesList {...params} />;
}
