import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledByKind } from 'shared/components/ControlledBy/ControlledBy';
import { Link } from 'shared/components/Link/Link';

import { SecretCreate } from './SecretCreate';

export function SecretList(props) {
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
      createResourceForm={SecretCreate}
      {...props}
    />
  );
}
export default SecretList;
