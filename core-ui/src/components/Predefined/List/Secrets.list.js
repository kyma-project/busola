import React from 'react';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledByKind } from 'shared/components/ControlledBy/ControlledBy';
import { useTranslation } from 'react-i18next';
import { Link } from 'shared/components/Link/Link';
import { Trans } from 'react-i18next';
import { SecretsCreate } from '../Create/Secrets/Secrets.create';

const SecretsList = props => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: secret => (
        <ControlledByKind ownerReferences={secret.metadata.ownerReferences} />
      ),
    },
    {
      header: t('secrets.headers.type'),
      value: secret => {
        return secret.type;
      },
    },
  ];

  const description = (
    <Trans i18nKey="secrets.description">
      <Link
        className="fd-link"
        url="https://kubernetes.io/docs/concepts/configuration/secret/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      createResourceForm={SecretsCreate}
      {...props}
    />
  );
};
export default SecretsList;
