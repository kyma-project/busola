import React from 'react';

import LambdaDetails from './LambdaDetails';
import { useConfigData } from 'components/Lambdas/helpers/misc/useConfigData';

import './LambdaDetails.scss';

export default function LambdaDetailsWrapper({ lambda }) {
  useConfigData();
  let content = null;

  if (!lambda) {
    content = <>Entry not found</>;
  } else {
    content = <LambdaDetails lambda={lambda} />;
  }

  return <div className="lambda-details">{content}</div>;
}
