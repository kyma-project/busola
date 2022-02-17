import React from 'react';
import { useTranslation } from 'react-i18next';
import { WorkloadSelector } from 'shared/components/WorkloadSelector/WorkloadSelector';

import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';

import { Rules } from './Rules';

export const AuthorizationPoliciesDetails = ({
  DefaultRenderer,
  ...otherParams
}) => {
  const { t } = useTranslation();

  const getAction = policy => {
    if (policy.spec?.action) return policy.spec?.action;
    else return 'ALLOW';
  };

  const getProvider = policy => {
    if (policy.spec.provider?.name) return policy.spec.provider?.name;
    else return EMPTY_TEXT_PLACEHOLDER;
  };

  const customColumns = [
    {
      header: t('authorization-policies.headers.action'),
      value: getAction,
    },
    {
      header: t('authorization-policies.headers.provider'),
      value: getProvider,
    },
  ];

  const WorkloadSelectorLabels = policy => (
    <WorkloadSelector
      resource={policy}
      labels={policy.spec.selector?.matchLabels}
    />
  );

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={[Rules, WorkloadSelectorLabels]}
      {...otherParams}
    ></DefaultRenderer>
  );
};
