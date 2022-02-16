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

  const customColumns = [
    {
      header: t('authorizationpolicies.headers.action'),
      value: ({ spec }) => <p>{spec.action || 'ALLOW'}</p>,
    },
    {
      header: t('authorizationpolicies.headers.provider'),
      value: ({ spec }) => (
        <p>{spec.provider?.name || EMPTY_TEXT_PLACEHOLDER}</p>
      ),
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
      customComponents={[WorkloadSelectorLabels, Rules]}
      {...otherParams}
    ></DefaultRenderer>
  );
};
