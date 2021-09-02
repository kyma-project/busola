import React from 'react';
import { useTranslation } from 'react-i18next';

import { GenericList, EMPTY_TEXT_PLACEHOLDER, StatusBadge } from 'react-shared';
import { ResourcePods } from './ResourcePods.js';
import { getPodsCount, getStatusType } from '../List/DaemonSets.list';

const Tolerations = ({ resource, i18n }) => {
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
      i18n={i18n}
    />
  );
};

const Images = ({ resource, i18n }) => {
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
      i18n={i18n}
    />
  );
};

const customColumns = [
  {
    header: 'Status',
    value: resource => {
      const podsCount = getPodsCount(resource);
      const statusType = getStatusType(resource);
      return <StatusBadge type={statusType}>{podsCount}</StatusBadge>;
    },
  },
];

export const DaemonSetsDetails = ({
  DefaultRenderer,
  i18n,
  ...otherParams
}) => {
  return (
    <DefaultRenderer
      customComponents={[
        resource => Tolerations({ resource, i18n }),
        resource => Images({ resource, i18n }),
        resource => ResourcePods(resource, null, true),
      ]}
      customColumns={customColumns}
      {...otherParams}
    ></DefaultRenderer>
  );
};
