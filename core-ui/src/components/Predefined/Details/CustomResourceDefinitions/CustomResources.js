import React from 'react';
import * as jp from 'jsonpath';
import {
  GenericList,
  prettifyNamePlural,
  EMPTY_TEXT_PLACEHOLDER,
} from 'react-shared';
import { useTranslation } from 'react-i18next';
import { useNavigateToCustomResource } from './useNavigateToCustomResource';
import CustomResourcesList from 'components/Predefined/List/CustomResourceDefinitions.list';

export function CustomResources({
  crd,
  namespace,
  version,
  i18n,
  showTitle = true,
  showNamespace,
  hideCreateOption,
}) {
  const { t } = useTranslation();
  const { group, names } = crd.spec;
  const name = names.plural;
  const navigateFn = useNavigateToCustomResource();

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
    resourceType: name,
    namespace,
    isCompact: true,
    showTitle,
    customColumns,
    testid: 'crd-custom-resources',
    showNamespace,
    hideCreateOption,
  };

  return <CustomResourcesList {...params} />;
}
