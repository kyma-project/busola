import React from 'react';
import { useTranslation } from 'react-i18next';

import { GenericList, EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { ResourcePods } from './ResourcePods.js';

const Tolerations = resource => {
  const { t } = useTranslation();

  const headerRenderer = () => [
    t('daemon-sets.tolerations.key'),
    t('daemon-sets.tolerations.operator'),
    t('daemon-sets.tolerations.effect'),
    t('daemon-sets.tolerations.toleration-seconds'),
  ];
  const rowRenderer = entry => [
    entry.key || EMPTY_TEXT_PLACEHOLDER,
    entry.operator || EMPTY_TEXT_PLACEHOLDER,
    entry.effect || EMPTY_TEXT_PLACEHOLDER,
    entry.tolerationSeconds || EMPTY_TEXT_PLACEHOLDER,
  ];
  const textSearchProperties = [
    'key',
    'operator',
    'effect',
    'toleration-seconds',
  ];
  return (
    <GenericList
      title={t('daemon-sets.tolerations.title')}
      entries={resource.spec.template.spec.tolerations || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      testid="daemon-set-tolerations"
      textSearchProperties={textSearchProperties}
    />
  );
};

const Images = resource => {
  const { t } = useTranslation();

  const getImages = daemonSet => {
    const images =
      daemonSet.spec.template.spec.containers?.map(
        container => container.image,
      ) || [];
    return images;
  };

  const headerRenderer = () => [t('daemon-sets.images')];
  const rowRenderer = entry => [
    <span style={{ overflowWrap: 'anywhere' }}>{entry}</span>,
  ];
  return (
    <GenericList
      title={t('daemon-sets.images')}
      entries={getImages(resource) || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      testid="daemon-set-images"
      showHeader={false}
    />
  );
};

export const DaemonSetsDetails = ({ DefaultRenderer, ...otherParams }) => {
  return (
    <DefaultRenderer
      customComponents={[
        Tolerations,
        Images,
        resource => ResourcePods(resource, null, true),
      ]}
      {...otherParams}
    ></DefaultRenderer>
  );
};
