import React from 'react';
import LuigiClient from '@luigi-project/client';

const PlanSelector = ({
  allPlans,
  currentlySelected,
  serviceClassName,
  serviceClassKind,
}) => {
  if (!Array.isArray(allPlans)) return null;

  function handlePlanChange(e) {
    LuigiClient.linkManager()
      .fromClosestContext()
      .withParams({
        resourceType: serviceClassKind,
      })
      .navigate(`details/${serviceClassName}/plan/${e.target.value}`);
  }

  return (
    <select
      defaultValue={currentlySelected && currentlySelected.name}
      onChange={handlePlanChange}
      aria-label="plan-selector"
    >
      {allPlans.map(p => (
        <option value={p.metadata.name} key={p.metadata.uid}>
          {p.spec.externalMetadata?.displayName}
        </option>
      ))}
    </select>
  );
};

export default PlanSelector;
