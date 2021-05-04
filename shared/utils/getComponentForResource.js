import React, { useMemo } from 'react';
import { useMicrofrontendContext } from '../';

function findByName(object, propertyName) {
  return object[
    Object.keys(object).find(
      k => k.toLowerCase() === propertyName.toLowerCase(),
    )
  ];
}

export const ComponentFor = ({
  PredefinedRenderersCollection,
  GenericRenderer,
  ...componentProps
}) => {
  const {
    name,
    params,
    nameForCreate,
    defaultRenderer = GenericRenderer,
  } = componentProps;
  const microfrontendContext = useMicrofrontendContext();

  const predefined = findByName(PredefinedRenderersCollection, name);
  const Renderer = predefined
    ? useMemo(() => predefined(defaultRenderer), [predefined, defaultRenderer])
    : defaultRenderer;
  const CreateFormRenderer = nameForCreate
    ? findByName(PredefinedRenderersCollection, nameForCreate) || null
    : null;

  return (
    <Renderer
      createResourceForm={CreateFormRenderer}
      {...params}
      microfrontendContext={microfrontendContext}
    />
  );
};
