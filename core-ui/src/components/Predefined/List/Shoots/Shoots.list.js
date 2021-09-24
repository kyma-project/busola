import React from 'react';
import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { useTranslation } from 'react-i18next';

export function ShootsList({ DefaultRenderer, ...otherParams }) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('common.headers.version'),
      value: shoot => shoot.spec.kubernetes.version,
    },
    {
      header: t('common.headers.created-by'),
      value: shoot =>
        shoot.metadata.annotations?.['gardener.cloud/created-by'] ||
        EMPTY_TEXT_PLACEHOLDER,
    },
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
}
