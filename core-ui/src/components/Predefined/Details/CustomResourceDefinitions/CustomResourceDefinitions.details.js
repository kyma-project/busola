import React from 'react';
import { CustomResources } from './CustomResources.list';

export const CustomResourceDefinitionsDetails = ({
  DefaultRenderer,
  ...otherParams
}) => {
  return (
    <DefaultRenderer
      customComponents={[CustomResources]}
      {...otherParams}
    ></DefaultRenderer>
  );
};
