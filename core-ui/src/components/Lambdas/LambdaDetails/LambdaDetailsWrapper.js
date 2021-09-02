import React from 'react';

import LambdaDetails from './LambdaDetails';
import { useConfigData } from 'components/Lambdas/helpers/misc/useConfigData';

import './LambdaDetails.scss';

export default function LambdaDetailsWrapper({ lambda, i18n }) {
  useConfigData();
  let content = null;

  if (!lambda) {
    content = <>Entry not found</>;
  } else {
    content = <LambdaDetails lambda={lambda} i18n={i18n} />;
  }

  return <div className="lambda-details">{content}</div>;
}
