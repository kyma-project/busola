import React from 'react';
import { useTranslation } from 'react-i18next';
import { Selector } from 'shared/components/Selector/Selector';

import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';

import { Rules } from './Rules';

export const AuthorizationPoliciesDetails = ({
  DefaultRenderer,
  ...otherParams
}) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('authorization-policies.headers.action'),
      value: policy => policy.spec?.action || 'ALLOW',
    },
    {
      header: t('authorization-policies.headers.provider'),
      value: policy => policy.spec?.provider?.name || EMPTY_TEXT_PLACEHOLDER,
    },
  ];

  const MatchSelector = policy => (
    <Selector
      namespace={policy.metadata.namespace}
      labels={policy.spec?.selector?.matchLabels}
      isIstioSelector
      selector={policy.spec?.selector}
    />
  );

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={[Rules, MatchSelector]}
      {...otherParams}
    ></DefaultRenderer>
  );
};
