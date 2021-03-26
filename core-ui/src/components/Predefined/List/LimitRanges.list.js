import React from 'react';

export const LimitRangesList = DefaultRenderer => ({ ...otherParams }) => {
  const customColumns = [
    {
      header: 'Max',
      value: limit => limit.spec.limits[0]?.max?.memory,
    },
    {
      header: 'Default',
      value: limit => limit.spec.limits[0]?.default?.memory,
    },
    {
      header: 'Default Request',
      value: limit => limit.spec.limits[0]?.defaultRequest?.memory,
    },
  ];

  return (
    <DefaultRenderer
      resourceName="Limit Ranges"
      customColumns={customColumns}
      {...otherParams}
    />
  );
};
