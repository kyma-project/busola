import React from 'react';
import { StatusBadge } from 'react-shared';

const statusColumn = {
  header: 'Status',
  value: addon => (
    <StatusBadge autoResolveType>{addon.status?.phase}</StatusBadge>
  ),
};

export const AddonsConfigurationsList = ({
  DefaultRenderer,
  ...otherParams
}) => {
  const customColumns = [statusColumn];
  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};

export const ClusterAddonsConfigurationsList = AddonsConfigurationsList;
