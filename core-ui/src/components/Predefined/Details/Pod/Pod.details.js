import React from 'react';
import { GenericList } from 'react-shared';

import { PodStatus } from './PodStatus';
import ContainersData from './ContainersData';
import LuigiClient from '@luigi-project/client';
import { Link } from 'fundamental-react';

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
  const customColumns = [
    {
      header: 'Pod IP',
      value: pod => pod.status.podIP,
    },
    {
      header: 'Status',
      value: pod => <PodStatus pod={pod} />,
    },
  ];

  const VolumesList = resource => {
    const headerRenderer = _ => ['Volume Name', 'Type', 'Name'];
    const rowRenderer = volume => {
      const volumeType = Object.keys(volume).find(key => key !== 'name');
      return [
        volume.name,
        volumeType,
        <Link
          className="link"
          onClick={() => goToSecretDetails(volumeType, volume[volumeType].name)}
        >
          {volume[volumeType].name}
        </Link>,
      ];
    };

    return (
      <GenericList
        key="volumes"
        title="Volumes"
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        entries={resource.spec.volumes}
      />
    );
  };

  const Containers = resource => (
    <ContainersData
      key="containers"
      type="Containers"
      containers={resource.spec.containers}
    />
  );
  const InitContainers = resource => (
    <ContainersData
      key="init-containers"
      type="Init containers"
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
