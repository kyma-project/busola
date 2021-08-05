import React from 'react';
import { useTranslation } from 'react-i18next';

export const StatefulSetsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  return (
    <DefaultRenderer resourceName={t('stateful-sets.title')} {...otherParams} />
  );
};
