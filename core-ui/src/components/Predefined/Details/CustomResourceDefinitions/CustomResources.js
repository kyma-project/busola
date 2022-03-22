import React from 'react';
import LuigiClient from '@luigi-project/client';
import * as jp from 'jsonpath';
import {
  GenericList,
  prettifyNamePlural,
  EMPTY_TEXT_PLACEHOLDER,
  useMicrofrontendContext,
} from 'react-shared';
import { useTranslation } from 'react-i18next';
import { ComponentForList } from 'shared/getComponents';
import { navigateToResource } from 'shared/helpers/universalLinks';

export function CustomResources({
  crd,
  namespace,
  version,
  i18n,
  showTitle = true,
}) {
  const { t } = useTranslation();
  const { group, names, scope } = crd.spec;
  const name = names.plural;
  const { clusterNodes, namespaceNodes } = useMicrofrontendContext();

  if (!version.served) {
    return (
      <GenericList
        title={prettifyNamePlural(undefined, name)}
        notFoundMessage={t('custom-resource-definitions.messages.no-entries')}
        entries={[]}
        headerRenderer={() => []}
        rowRenderer={() => []}
        showTitle={showTitle}
        i18n={i18n}
      />
    );
  }

  const resourceUrl = namespace
    ? `/apis/${group}/${version.name}/namespaces/${namespace}/${name}`
    : `/apis/${group}/${version.name}/${name}`;

  const navigateFn = cr => {
    const crdNamePlural = crd.spec.names.plural;
    const clusterNode = clusterNodes.find(
      res => res.resourceType === crdNamePlural,
    );
    const namespaceNode = namespaceNodes.find(
      res => res.resourceType === crdNamePlural,
    );

    if (clusterNode) {
      navigateToResource({
        name: cr.metadata.name,
        kind: clusterNode.pathSegment,
      });
    } else if (namespaceNode) {
      navigateToResource({
        namespace: cr.metadata.namespace,
        name: cr.metadata.name,
        kind: namespaceNode.pathSegment,
      });
    } else {
      if (crd.spec.scope === 'Cluster') {
        LuigiClient.linkManager()
          .fromContext('cluster')
          .navigate(`customresources/${crd.metadata.name}/${cr.metadata.name}`);
      } else {
        LuigiClient.linkManager()
          .fromContext('cluster')
          .navigate(
            `namespaces/${cr.metadata.namespace}/customresources/${crd.metadata.name}/${cr.metadata.name}`,
          );
      }
    }
  };

  const getJsonPath = (resource, jsonPath) => {
    const value =
      jp.value(resource, jsonPath.substring(1)) || EMPTY_TEXT_PLACEHOLDER;

    if (typeof value === 'boolean') {
      return value.toString();
    } else if (typeof value === 'object') {
      return JSON.stringify(value);
    } else {
      return value;
    }
  };

  const customColumns = version.additionalPrinterColumns?.map(column => ({
    header: column.name,
    value: resource => getJsonPath(resource, column.jsonPath),
  }));
  // CRD can have infinite number of additionalPrinterColumns what would be impossible to fit into the table
  if (customColumns?.length > 5) customColumns.length = 5;

  const params = {
    hasDetailsView: true,
    navigateFn,
    resourceUrl,
    resourceType: name,
    namespace,
    isCompact: true,
    showTitle,
    customColumns,
    testid: 'crd-custom-resources',
    showNamespace: scope === 'Namespaced' || !namespace,
  };

  return <ComponentForList name={name} params={params} />;
}
