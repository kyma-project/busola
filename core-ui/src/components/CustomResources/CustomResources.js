import React from 'react';
import * as jp from 'jsonpath';
import pluralize from 'pluralize';

import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useNavigateToCustomResource } from 'resources/CustomResourceDefinitions/useNavigateToCustomResource';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { CRCreate } from 'resources/CustomResourceDefinitions/CRCreate';

export function CustomResources({
  crd,
  namespace,
  version,
  showTitle = true,
  showNamespace,
  hideCreateOption,
}) {
  const { group, names } = crd.spec;
  const name = names.plural;
  const navigateFn = useNavigateToCustomResource();

  const resourceUrl = namespace
    ? `/apis/${group}/${version.name}/namespaces/${namespace}/${name}`
    : `/apis/${group}/${version.name}/${name}`;

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
    navigateFn: cr => navigateFn(cr, crd),
    resourceUrl,
    resourceName: crd.spec.names.kind,
    title: pluralize(crd.spec.names.kind),
    resourceType: crd.spec.names.kind,
    namespace,
    isCompact: true,
    showTitle,
    customColumns,
    testid: 'crd-custom-resources',
    showNamespace,
    hideCreateOption,
    createResourceForm: props => <CRCreate {...props} crd={crd} />,
  };

  return <ResourcesList {...params} />;
}
