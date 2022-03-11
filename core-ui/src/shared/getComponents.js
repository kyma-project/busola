import React from 'react';
import { useTranslation } from 'react-i18next';

import { ComponentFor, ResourcesList } from 'react-shared';
import * as PredefinedRenderers from 'components/Predefined';

export const ComponentForList = props => {
  const { i18n } = useTranslation();
  return (
    <ComponentFor
      PredefinedRenderersCollection={PredefinedRenderers}
      GenericRenderer={ResourcesList}
      i18n={i18n}
      {...props}
    />
  );
};
