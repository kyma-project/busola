import React from 'react';
import { ResourcePods } from '../ResourcePods';

export function StatefulSetsDetails({ DefaultRenderer, ...otherParams }) {
  const customComponents = [ResourcePods];

  return (
    <DefaultRenderer
      customComponents={customComponents}
      {...otherParams}
    ></DefaultRenderer>
  );
}
