import React from 'react';
import { ControlledByKind } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

export const SecretsList = ({ DefaultRenderer, ...otherParams }) => {
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
        url="https://kyma-project.io/docs/kyma/latest/03-tutorials/00-serverless/svls-09-log-into-private-packages-registry#create-a-secret"
      />
    </Trans>
  );

  return (
    <DefaultRenderer
      customColumns={customColumns}
      description={description}
      {...otherParams}
    />
  );
};
