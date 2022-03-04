import React from 'react';
import PropTypes from 'prop-types';
import { FormItem, FormLabel } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { CustomPropTypes, Dropdown } from 'react-shared';
import { getResourceDisplayName } from 'helpers';

const SERVICE_PLAN_SHAPE = PropTypes.shape({
  name: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
});

export const PlanColumnContent = ({ onPlanChange, dropdownRef, allPlans }) => {
  const { i18n } = useTranslation();

  const options = allPlans.map(plan => ({
    key: plan.spec.externalID,
    text: getResourceDisplayName(plan),
  }));
  const selectedPlan = dropdownRef?.current
    ? dropdownRef.current
    : options[0].key;

  return (
    <FormItem>
      <FormLabel required htmlFor="plan">
        Plan
      </FormLabel>
      <Dropdown
        id="service-plan-selector"
        options={options}
        onSelect={(_, selected) => onPlanChange(selected.key)}
        selectedKey={selectedPlan}
        emptyListMessage="No Plans available for this Service Class"
        i18n={i18n}
      ></Dropdown>
    </FormItem>
  );
};

PlanColumnContent.proTypes = {
  onPlanChange: PropTypes.func.isRequired,
  dropdownRef: CustomPropTypes.ref.isRequired,
  allPlans: PropTypes.arrayOf(SERVICE_PLAN_SHAPE),
};
