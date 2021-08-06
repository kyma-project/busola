import React from 'react';
import { useTranslation } from 'react-i18next';
import { Labels, StatusBadge } from 'react-shared';

export const DaemonSetsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const getImages = daemonSet => {
    const images =
      daemonSet.spec.template.spec.containers?.map(
        container => container.image,
      ) || [];
    return images;
  };

  const isStatusOk = daemonSet => {
    const allPods =
      daemonSet.status.numberReady + (daemonSet.status.numberUnavailable || 0);
    return daemonSet.status.numberReady === allPods;
  };

  const getStatusType = daemonSet => {
    return isStatusOk(daemonSet) ? 'success' : 'error';
  };

  const getPodsCount = daemonSet => {
    const allPods =
      daemonSet.status.numberReady + (daemonSet.status.numberUnavailable || 0);
    return `${daemonSet.status.numberReady || 0} / ${allPods || 0}`;
  };

  const customColumns = [
    {
      header: t('daemon-sets.images'),
      value: resource => {
        const images = getImages(resource);
        return images?.map(image => <p>{image}</p>);
      },
    },
    {
      header: t('daemon-sets.pods'),
      value: resource => {
        const podsCount = getPodsCount(resource);
        const statusType = getStatusType(resource);
        return <StatusBadge type={statusType}>{podsCount}</StatusBadge>;
      },
    },
    {
      header: t('daemon-sets.node-selector'),
      value: resource => (
        <Labels
          labels={resource.spec.template.spec.nodeSelector}
          shortenLongLabels
        />
      ),
    },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      resourceName={t('daemon-sets.title')}
      {...otherParams}
    />
  );
};
