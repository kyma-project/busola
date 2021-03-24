import React from 'react';
import { GenericList } from 'react-shared';

import { PodStatus } from './PodStatus';
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
  let preperedResourceKind = toSnakeCase(resourceKind);

  LuigiClient.linkManager()
    .fromContext('namespaces')
    .navigate(`${preperedResourceKind}s/details/${name}`);
}

export const PodsDetails = DefaultRenderer => ({ ...otherParams }) => {
  const customColumns = [
    {
      header: 'Status',
      value: pod => <PodStatus pod={pod} />,
    },
  ];

  const VolumesList = resource => {
    console.log('volumes', resource.spec.volumes);
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

  return (
    <DefaultRenderer
      customComponents={[VolumesList]}
      customColumns={customColumns}
      {...otherParams}
    ></DefaultRenderer>
  );
};
