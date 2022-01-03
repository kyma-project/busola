import React from 'react';
import { useTranslation } from 'react-i18next';
import { ComponentForList } from 'shared/getComponents';

export function RelatedCRDsList(resource) {
  const { t } = useTranslation();
  const resourceUrl = '/apis/apiextensions.k8s.io/v1/customresourcedefinitions';

  const filterByCategories = crd => {
    return resource.spec.names.categories?.some(
      category =>
        category !== 'all' &&
        crd.metadata.name !== resource.metadata.name &&
        crd.spec.scope === resource.spec.scope &&
        crd.spec.names.categories?.includes(category),
    );
  };
  return (
    <ComponentForList
      name="customResourceDefinitionsList"
      key="common-categories-list"
      params={{
        hasDetailsView: true,
        fixedPath: true,
        resourceUrl,
        resourceType: 'customresourcedefinitions',
        isCompact: true,
        showTitle: true,
        filter: filterByCategories,
        title: t('custom-resource-definitions.subtitle.related-crds'),
        pagination: { itemsPerPage: 5 },
      }}
    />
  );
}
