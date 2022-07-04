import React from 'react';
import { useTranslation } from 'react-i18next';

import FunctionDetails from './FunctionDetails';
import { useConfigData } from 'components/Functions/helpers/misc/useConfigData';

import './FunctionDetails.scss';

export default function FunctionDetailsWrapper({ func }) {
  useConfigData();
  let content = null;
  const { t } = useTranslation();

  if (!func) {
    content = <>{t('common.messages.entry-not-found')}</>;
  } else {
    content = <FunctionDetails func={func} />;
  }

  return <div className="function-details">{content}</div>;
}
