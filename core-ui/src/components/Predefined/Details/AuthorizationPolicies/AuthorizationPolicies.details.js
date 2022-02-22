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
      header: t('authorization-policies.headers.action'),
      value: policy => policy.spec?.action || 'ALLOW',
    },
    {
      header: t('authorization-policies.headers.provider'),
      value: policy => policy.spec?.provider?.name || EMPTY_TEXT_PLACEHOLDER,
    },
  ];

  const WorkloadSelectorLabels = policy => {
    const { t } = useTranslation();
    return (
      <WorkloadSelector
        resource={policy}
        labels={policy.spec.selector?.matchLabels}
        title={t('authorization-policies.headers.selector')}
      />
    );
  };

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={[Rules, WorkloadSelectorLabels]}
      {...otherParams}
    ></DefaultRenderer>
  );
};
