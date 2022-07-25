import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Link } from 'shared/components/Link/Link';
import { Tokens } from 'shared/components/Tokens';

import { CustomResourceDefinitionCreate } from './CustomResourceDefinitionCreate';

export function CustomResourceDefinitionList(props) {
  const { t } = useTranslation();

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
        url="https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      textSearchProperties={['spec.names.categories']}
      description={description}
      customColumns={customColumns}
      createResourceForm={
        props.hideCreateOption ? null : CustomResourceDefinitionCreate
      }
      {...props}
    />
  );
}

export default CustomResourceDefinitionList;
