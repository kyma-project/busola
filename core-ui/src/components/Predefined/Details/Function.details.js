import React from 'react';
import { useTranslation } from 'react-i18next';

import LambdaDetailsWrapper from 'components/Lambdas/LambdaDetails/LambdaDetailsWrapper';
import { prettySourceType } from 'components/Lambdas/helpers/lambdas';
import { prettyRuntime } from 'components/Lambdas/helpers/runtime';
import { LambdaStatusBadge } from 'components/Lambdas/LambdaStatusBadge/LambdaStatusBadge';

export const FunctionsDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('common.headers.status'),
      value: resource => <LambdaStatusBadge status={resource.status} />,
    },
    {
      header: t('functions.headers.source-type'),
      value: resource => prettySourceType(resource.spec.type, t),
    },
    {
      header: t('functions.headers.runtime'),
      value: resource => prettyRuntime(resource.spec.runtime),
    },
  ];

  const Functions = resource => {
    return <LambdaDetailsWrapper key="lambdaDetails" lambda={resource} />;
  };
  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={[Functions]}
      {...otherParams}
    />
  );
};
