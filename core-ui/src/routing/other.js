import React from 'react';

import customResourceDetails from './other/CustomResourceDetails.routes';
import customResourceListOfType from './other/CustomResourceListOfType.routes.js';
import customResourceDefinitions from './other/CustomResourceDefinitions.routes.js';
import customResourcesByGroup from './other/CustomResourcesByGroup.routes.js';

const other = (
  <>
    {customResourceDetails}
    {customResourceListOfType}
    {customResourceDefinitions}
    {customResourcesByGroup}
  </>
);

export default other;
