import React from 'react';
import { useTranslation } from 'react-i18next';

import { DestinationRuleRefs } from './DestinationRuleRefs';
import { TrafficPolicy } from './TrafficPolicy';
import { Subset } from './Subset';

export function DestinationRulesDetails({ DefaultRenderer, ...otherParams }) {
  const { t } = useTranslation();

  return (
    <DefaultRenderer
      resourceName={t('destination-rules.title')}
      customComponents={[DestinationRuleRefs, TrafficPolicy, Subset]}
      {...otherParams}
    />
  );
}
