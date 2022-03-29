import React from 'react';
import { Rules } from './Rules.js';
import { useTranslation } from 'react-i18next';

import './RolesDetails.scss';

export function RolesDetails({ DefaultRenderer, ...otherParams }) {
  const { t } = useTranslation();
  return (
    <DefaultRenderer
      resourceTitle={t('roles.title')}
      {...otherParams}
      customComponents={[Rules]}
    />
  );
}
export function ClusterRolesDetails({ DefaultRenderer, ...otherParams }) {
  const { t } = useTranslation();
  return (
    <DefaultRenderer
      resourceTitle={t('cluster-roles.title')}
      {...otherParams}
      customComponents={[Rules]}
    />
  );
}
