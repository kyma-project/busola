import React from 'react';

import { GenericList, EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { ResourcePods } from './ResourcePods.js';

const Tolerations = resource => {
  const headerRenderer = () => [
    'Key',
    'Operator',
    'Effect',
    'Toleration Seconds',
  ];

  const rowRenderer = entry => [
    entry.key || EMPTY_TEXT_PLACEHOLDER,
    entry.operator || EMPTY_TEXT_PLACEHOLDER,
    entry.effect || EMPTY_TEXT_PLACEHOLDER,
    entry.tolerationSeconds || EMPTY_TEXT_PLACEHOLDER,
  ];
  return (
    <GenericList
      title="Tolerations"
      entries={resource.spec.template.spec.tolerations || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      testid="daemon-set-tolerations"
    />
  );
};

export const DaemonSetsDetails = ({ DefaultRenderer, ...otherParams }) => {
  return (
    <DefaultRenderer
      customComponents={[ResourcePods, Tolerations]}
      {...otherParams}
    ></DefaultRenderer>
  );
};
