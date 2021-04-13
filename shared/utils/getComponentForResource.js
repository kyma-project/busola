import React, { useEffect, useRef } from 'react';
// import { ResourcesList } from 'react-shared';
import { useGet } from '../hooks';

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
  const lastPredefined = useRef(null);
  const {
    name,
    params,
    nameForCreate,
    defaultRenderer = GenericRenderer,
  } = componentProps;

  const Predefined = findByName(PredefinedRenderersCollection, name);
  // console.log(
  //   'is PRedefined equal to last ref',
  //   Predefined === lastPredefined.current,
  // );

  lastPredefined.current = Predefined;

  // const Renderer = predefined || defaultRenderer;
  const CreateFormRenderer = nameForCreate
    ? findByName(PredefinedRenderersCollection, nameForCreate) || null
    : null;

  return <Predefined {...params} />;
};
