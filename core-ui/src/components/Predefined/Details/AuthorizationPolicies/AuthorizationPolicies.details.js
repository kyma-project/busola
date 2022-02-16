import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutPanel, Link } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { WorkloadSelector } from 'shared/components/WorkloadSelector/WorkloadSelector';

import { EMPTY_TEXT_PLACEHOLDER, Labels } from 'react-shared';

import { Selector } from './Selector';
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
