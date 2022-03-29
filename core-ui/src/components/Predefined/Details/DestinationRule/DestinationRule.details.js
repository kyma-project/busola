import React from 'react';
import { useTranslation } from 'react-i18next';
import { DestinationRuleRefs } from './DestinationRuleRefs';
import { TrafficPolicy } from './TrafficPolicy';
import { Subset } from './Subset';
import { ResourceDetails } from 'react-shared';
import { DestinationRulesCreate } from '../../Create/DestinationRules/DestinationRules.create';

function DestinationRulesDetails(props) {
  const { t } = useTranslation();

  return (
    <ResourceDetails
      resourceName={t('destination-rules.title')}
      customComponents={[DestinationRuleRefs, TrafficPolicy, Subset]}
      createResourceForm={DestinationRulesCreate}
      {...props}
    />
  );
}

export default DestinationRulesDetails;
