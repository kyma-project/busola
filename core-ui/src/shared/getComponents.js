import React from 'react';

import { ComponentFor, ResourcesList, ResourceDetails } from 'react-shared';
import * as PredefinedRenderers from 'components/Predefined';

export const ComponentForList = props => (
  <ComponentFor
    PredefinedRenderersCollection={PredefinedRenderers}
    GenericRenderer={ResourcesList}
    {...props}
  />
);

export const ComponentForDetails = props => (
  <ComponentFor
    PredefinedRenderersCollection={PredefinedRenderers}
    GenericRenderer={ResourceDetails}
    {...props}
  />
);
