import React from 'react';
import LuigiClient from '@luigi-project/client';

import LambdaDetails from './LambdaDetails';
import { useConfigData } from 'components/Lambdas/helpers/misc/useConfigData';

import './LambdaDetails.scss';

export default function LambdaDetailsWrapper({ lambda }) {
  useConfigData();
  let content = null;

  if (!lambda) {
    content = <>Entry not found</>;
  } else {
    const crds = LuigiClient.getEventData().crds;
    content = <LambdaDetails lambda={lambda} crds={crds} />;
  }

  return <div className="lambda-details">{content}</div>;
}
