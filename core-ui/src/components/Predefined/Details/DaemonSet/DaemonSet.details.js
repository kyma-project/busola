import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  ControlledBy,
  GenericList,
  EMPTY_TEXT_PLACEHOLDER,
} from 'react-shared';
import { Selector } from 'shared/components/Selector/Selector';
import { DaemonSetStatus } from './DaemonSetStatus';

const Tolerations = resource => {
  const { t, i18n } = useTranslation();

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

const Images = resource => {
  const { t, i18n } = useTranslation();

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

export const DaemonSetsDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: resource => (
        <ControlledBy ownerReferences={resource.metadata.ownerReferences} />
      ),
    },
    {
      header: t('common.headers.pods'),
      value: resource => <DaemonSetStatus daemonSet={resource} />,
    },
  ];

  const MatchSelector = daemonSet => {
    <Selector
      namespace={daemonSet.metadata.namespace}
      labels={daemonSet.spec?.selector?.matchLabels}
      expressions={daemonSet.spec?.selector?.matchExpressions}
      selector={daemonSet.spec?.selector}
    />;
  };

  return (
    <DefaultRenderer
      customComponents={[Tolerations, Images, MatchSelector]}
      customColumns={customColumns}
      {...otherParams}
    />
  );
};
