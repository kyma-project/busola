import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';
import CustomResourceDefinitionsList from 'components/Predefined/List/CustomResourceDefinitions.list';

export function RelatedCRDsList(resource) {
  const { t, i18n } = useTranslation();
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
    <CustomResourceDefinitionsList
      {...{
        hasDetailsView: true,
        fixedPath: true,
        resourceUrl,
        resourceType: 'customresourcedefinitions',
        isCompact: true,
        showTitle: true,
        filter: filterByCategories,
        title: t('custom-resource-definitions.subtitle.related-crds'),
        pagination: { itemsPerPage: 5 },
        hideCreateOption: true,
        i18n,
        navigateFn: crd => {
          LuigiClient.linkManager()
            .fromContext('cluster')
            .navigate(
              '/customresourcedefinitions/details/' + crd.metadata.name,
            );
        },
      }}
    />
  );
}
