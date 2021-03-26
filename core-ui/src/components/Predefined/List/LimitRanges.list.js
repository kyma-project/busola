import React from 'react';
import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';

export const LimitRangesList = DefaultRenderer => ({ ...otherParams }) => {
  const customColumns = [
    {
      header: 'Max',
      value: limit =>
        limit.spec.limits[0]?.max?.memory || EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: 'Default',
      value: limit =>
        limit.spec.limits[0]?.default?.memory || EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: 'Default Request',
      value: limit =>
        limit.spec.limits[0]?.defaultRequest?.memory || EMPTY_TEXT_PLACEHOLDER,
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
