import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';

import { DestinationRuleRefs } from './DestinationRuleRefs';
import { TrafficPolicy } from './TrafficPolicy';
import { Subset } from './Subset';
import { DestinationRuleCreate } from './DestinationRuleCreate';

export function DestinationRuleDetails(props) {
  const { t } = useTranslation();

  return (
    <ResourceDetails
      resourceName={t('destination-rules.title')}
      customComponents={[DestinationRuleRefs, TrafficPolicy, Subset]}
      createResourceForm={DestinationRuleCreate}
      {...props}
    />
  );
}

export default DestinationRuleDetails;
