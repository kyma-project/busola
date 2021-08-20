import React from 'react';
import { DefinitionList } from '../../../../shared/components/DefinitionList/DefinitionList';

export function ServiceInstanceData({ spec, status }) {
  const list = [
    {
      name: 'Offering name:',
      value: spec.serviceOfferingName,
    },
    {
      name: 'Plan name:',
      value: spec.servicePlanName,
    },
    {
      name: 'External name:',
      value: spec.externalName,
    },
    {
      name: 'Instance ID:',
      value: status.instanceID || 'Not set',
    },
  ];

  return (
    <DefinitionList title="Instance Data" list={list} key="instance-data" />
  );
}
