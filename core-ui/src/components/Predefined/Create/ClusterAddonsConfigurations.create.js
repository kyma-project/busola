import React from 'react';
import { AddonsConfigurations } from './AddonsConfigurations/AddonsConfigurations.js';

export const ClusterAddonsConfigurationsCreate = ({
  resourceType,
  ...props
}) => <AddonsConfigurations resourceType={resourceType} {...props} />;
