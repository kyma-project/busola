import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

export const StorageClassesList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const description = (
    <Trans i18nKey="storage-classes.description">
      <Link
        className="fd-link"
        url="https://kubernetes.io/docs/concepts/storage/storage-classes/"
      />
    </Trans>
  );

  return (
    <DefaultRenderer
      resourceName={t('storage-classes.title')}
      description={description}
      {...otherParams}
    />
  );
};
