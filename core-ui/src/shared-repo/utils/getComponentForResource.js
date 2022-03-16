import React, { useMemo } from 'react';

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
  i18n,
  ...componentProps
}) => {
  const {
    name,
    params,
    nameForCreate,
    defaultRenderer = GenericRenderer,
  } = componentProps;

  const predefined = findByName(PredefinedRenderersCollection, name);
  const Renderer = predefined
    ? useMemo(() => predefined, [predefined, defaultRenderer])
    : defaultRenderer;
  const CreateFormRenderer = nameForCreate
    ? findByName(PredefinedRenderersCollection, nameForCreate) || null
    : null;

  return (
    <Renderer
      createResourceForm={CreateFormRenderer}
      DefaultRenderer={defaultRenderer}
      i18n={i18n}
      {...params}
    />
  );
};
