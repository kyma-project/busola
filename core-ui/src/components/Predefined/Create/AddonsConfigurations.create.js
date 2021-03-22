import React from 'react';
import { AddonsConfigurations } from './AddonsConfigurations/AddonsConfigurations.js';

export const AddonsConfigurationsCreate = ({ resourceType, ...props }) => (
  <AddonsConfigurations resourceType={resourceType} {...props} />
);
