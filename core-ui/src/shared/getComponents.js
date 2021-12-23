import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  ComponentFor,
  ResourcesList,
  ResourceDetails,
  usePluginRegistry,
} from 'react-shared';
import * as PredefinedRenderers from 'components/Predefined';
import { useBusolaComponents } from 'hooks/BusolaComponentsContext';

function usePredefinedPluginsRenderers() {
  const flatMapToObject = arr =>
    arr.reduce((acc, current) => ({ ...acc, ...current }), {});

  const { getByTags } = usePluginRegistry();

  const getPredefinedRenderers = plugin => {
    const resolved = plugin.resolved;

    return Object.fromEntries(
      Object.entries(resolved).filter(([key]) =>
        ['List', 'Create', 'Details'].some(suffix => key.endsWith(suffix)),
      ),
    );
  };

  return flatMapToObject(getByTags(['predefined']).map(getPredefinedRenderers));
}

export const ComponentForList = props => {
  const { i18n } = useTranslation();

  const busolaProps = useBusolaComponents();
  const pluginRenderers = usePredefinedPluginsRenderers();

  return (
    <ComponentFor
      PredefinedRenderersCollection={{
        ...PredefinedRenderers,
        ...pluginRenderers,
      }}
      GenericRenderer={ResourcesList}
      i18n={i18n}
      busolaProps={busolaProps}
      {...props}
    />
  );
};

export const ComponentForDetails = props => {
  const { i18n } = useTranslation();

  const busolaProps = useBusolaComponents();
  const pluginRenderers = usePredefinedPluginsRenderers();

  return (
    <ComponentFor
      PredefinedRenderersCollection={{
        ...PredefinedRenderers,
        ...pluginRenderers,
      }}
      GenericRenderer={ResourceDetails}
      i18n={i18n}
      busolaProps={busolaProps}
      {...props}
    />
  );
};
