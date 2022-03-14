import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';
import { Tokens } from 'shared/components/Tokens';

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
      value: crd => ({
        content: crd.spec.scope,
        style: { wordBreak: 'keep-all' },
      }),
    },
    {
      header: t('custom-resource-definitions.headers.categories'),
      value: crd => <Tokens tokens={crd.spec.names?.categories} />,
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
      resourceName={t('custom-resource-definitions.title')}
      textSearchProperties={['spec.names.categories']}
      filter={crd => filterCRDs(crd, namespace)}
      description={description}
      customColumns={customColumns}
      {...otherParams}
    />
  );
};
