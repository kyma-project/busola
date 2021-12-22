import React from 'react';
import { ControlledBy, GenericList } from 'react-shared';

import { PodStatus } from './PodStatus';
import ContainersData from './ContainersData';
import LuigiClient from '@luigi-project/client';
import { Link } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

function toSnakeCase(inputString) {
  return inputString
    .split('')
    .map(character => {
      if (character === character.toUpperCase()) {
        return '-' + character.toLowerCase();
      } else {
        return character;
      }
    })
    .join('');
}
function goToSecretDetails(resourceKind, name) {
  const preperedResourceKind = toSnakeCase(resourceKind);

  LuigiClient.linkManager()
    .fromContext('namespace')
    .navigate(`${preperedResourceKind}s/details/${name}`);
}

export const PodsDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t, i18n } = useTranslation();
  const customColumns = [
    {
      header: t('pods.headers.pod-ip'),
      value: pod => pod.status.podIP,
    },
    {
      header: t('common.headers.status'),
      value: pod => <PodStatus pod={pod} />,
    },
    {
      header: t('common.headers.owner'),
      value: pod => (
        <ControlledBy ownerReferences={pod.metadata.ownerReferences} />
      ),
    },
  ];

  const VolumesList = resource => {
    const headerRenderer = _ => [
      t('pods.headers.volume-name'),
      t('pods.headers.type'),
      t('common.headers.name'),
    ];
    const rowRenderer = volume => {
      const volumeType = Object.keys(volume).find(key => key !== 'name');
      return [
        volume.name,
        volumeType,
        <Link
          className="fd-link"
          onClick={() =>
            goToSecretDetails(volumeType.toLowerCase(), volume[volumeType].name)
          }
        >
          {volume[volumeType].name}
        </Link>,
      ];
    };

    return (
      <GenericList
        key="volumes"
        title={t('pods.labels.volumes')}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        entries={resource.spec.volumes}
        i18n={i18n}
      />
    );
  };

  const Containers = resource => (
    <ContainersData
      key="containers"
      type={t('pods.labels.constainers')}
      containers={resource.spec.containers}
    />
  );
  const InitContainers = resource => (
    <ContainersData
      key="init-containers"
      type={t('pods.labels.init-constainers')}
      containers={resource.spec.initContainers}
    />
  );

  return (
    <DefaultRenderer
      customComponents={[VolumesList, Containers, InitContainers]}
      customColumns={customColumns}
      {...otherParams}
    ></DefaultRenderer>
  );
};
