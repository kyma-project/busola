import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, ResourcesList } from 'react-shared';
import { Trans } from 'react-i18next';
import { Tokens } from 'shared/components/Tokens';
import { CustomResourceDefinitionsCreate } from '../Create/CustomResourceDefinitions/CustomResourceDefinitons.create';

const CustomResourceDefinitionsList = props => {
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
        url="https://kyma-project.io/docs/kyma/latest/05-technical-reference/00-custom-resources/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      textSearchProperties={['spec.names.categories']}
      description={description}
      customColumns={customColumns}
      createResourceForm={
        props.hideCreateOption ? null : CustomResourceDefinitionsCreate
      }
      {...props}
    />
  );
};

export default CustomResourceDefinitionsList;
