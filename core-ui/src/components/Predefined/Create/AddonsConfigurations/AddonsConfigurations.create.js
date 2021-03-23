import React from 'react';
import { AddonsConfigurations } from './AddonsConfigurations.js';

export const AddonsConfigurationsCreate = ({ resourceType, ...props }) => (
  <AddonsConfigurations resourceType={resourceType} {...props} />
);

export const ClusterAddonsConfigurationsCreate = ({
  resourceType,
  ...props
}) => <AddonsConfigurations resourceType={resourceType} {...props} />;
