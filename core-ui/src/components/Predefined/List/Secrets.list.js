import React from 'react';
import { ControlledByKind, ResourcesList } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
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
