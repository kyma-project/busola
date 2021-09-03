import React from 'react';
import { useTranslation } from 'react-i18next';

import LambdaDetails from './LambdaDetails';
import { useConfigData } from 'components/Lambdas/helpers/misc/useConfigData';

import './LambdaDetails.scss';

export default function LambdaDetailsWrapper({ lambda }) {
  useConfigData();
  let content = null;
  const { t } = useTranslation();

  if (!lambda) {
    content = <>{t('common.messages.entry-not-found')}</>;
  } else {
    content = <LambdaDetails lambda={lambda} />;
  }

  return <div className="lambda-details">{content}</div>;
}
