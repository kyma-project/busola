import React from 'react';
import { useRecoilValue } from 'recoil';
import { navigationNodesSelector } from 'state/navigation/navigationNodesSelector';

export const SidebarNavigation = () => {
  const navigationNodes = useRecoilValue(navigationNodesSelector);

  return (
    <nav>
      <p>{JSON.stringify(navigationNodes)}</p>
      <br />
      <br />
      <br />
      <br />
      {Object.entries(navigationNodes || {})?.map(([key, value]) => (
        <p>
          {key}: {value.length} {'->'}{' '}
          {value.map(v => v.resourceType).join(', ')}
        </p>
      ))}
    </nav>
  );
};
