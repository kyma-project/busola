import React from 'react';

import LambdaDetailsWrapper from 'components/Lambdas/LambdaDetails/LambdaDetailsWrapper';
import { prettySourceType } from 'components/Lambdas/helpers/lambdas';
import { prettyRuntime } from 'components/Lambdas/helpers/runtime';
import { LambdaStatusBadge } from 'components/Lambdas/LambdaStatusBadge/LambdaStatusBadge';
import { useTranslation } from 'react-i18next';

export const FunctionsDetails = ({ DefaultRenderer, i18n, ...otherParams }) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('common.headers.status'),
      value: resource => <LambdaStatusBadge status={resource.status} />,
    },
    {
      header: t('functions.headers.source-type'),
      value: resource => prettySourceType(resource.spec.type),
    },
    {
      header: t('functions.headers.runtime'),
      value: resource => prettyRuntime(resource.spec.runtime),
    },
  ];

  const Functions = (resource, resourceUrl) => {
    return (
      <LambdaDetailsWrapper key="lambdaDetails" lambda={resource} i18n={i18n} />
    );
  };
  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={[Functions]}
      {...otherParams}
    />
  );
};
