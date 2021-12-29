import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { Trans } from 'react-i18next';
const Categories = ({ categories }) => {
  return (
    <div className="categories-wrapper">
      {categories ? (
        categories.map(category => (
          <span className="fd-token fd-token--readonly" key={category}>
            <span
              className="fd-token__text fd-has-font-size-small"
              key={category}
            >
              {category}
            </span>
          </span>
        ))
      ) : (
        <p>{EMPTY_TEXT_PLACEHOLDER}</p>
      )}
    </div>
  );
};

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
    {
      header: 'Categories',
      value: crd => <Categories categories={crd.spec.names?.categories} />,
    },
  ];

  const description = (
    <Trans i18nKey="custom-resource-definitions.description">
      <Link
        className="fd-link"
        url="https://kyma-project.io/docs/kyma/latest/05-technical-reference/00-custom-resources/"
      />
    </Trans>
  );

  return (
    <DefaultRenderer
      filter={crd => filterCRDs(crd, namespace)}
      description={description}
      customColumns={customColumns}
      {...otherParams}
    />
  );
};
