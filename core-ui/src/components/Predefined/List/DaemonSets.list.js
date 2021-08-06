import React from 'react';
import { useTranslation } from 'react-i18next';
import { Labels } from 'react-shared';

export const DaemonSetsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const getImages = daemonSet => {
    const images =
      daemonSet.spec.template.spec.containers?.map(
        container => container.image,
      ) || [];
    return images;
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
      value: resource => resource.status.numberReady,
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
