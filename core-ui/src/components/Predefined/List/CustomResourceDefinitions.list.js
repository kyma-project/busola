import React from 'react';
import { useTranslation } from 'react-i18next';

export const CustomResourceDefinitionsList = ({
  DefaultRenderer,
  ...otherParams
}) => {
  const { t } = useTranslation();

  const { namespace } = otherParams;

  // to decide if we want 2 separate lists for namespaced/cluster scoped CRDs
  const filterCRDs = (crd, namespace) =>
    (namespace && crd.spec.scope === 'Namespaced') ||
    (!namespace && crd.spec.scope === 'Cluster');
  const customColumns = [
    {
      header: t('custom-resource-definitions.headers.scope'),
      value: crd => crd.spec.scope,
    },
  ];
  return (
    <DefaultRenderer
      filter={crd => filterCRDs(crd, namespace)}
      customColumns={customColumns}
      {...otherParams}
    />
  );
};
