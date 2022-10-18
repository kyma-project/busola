import React from 'react';
import { useRecoilValue } from 'recoil';
import { navigationNodesSelector } from 'state/navigation/navigationNodesSelector';

export const SidebarNavigation = () => {
  const navigationNodes = useRecoilValue(navigationNodesSelector);

  //useasync recoilValue ??????

  return (
    <nav>
      <p>{JSON.stringify(navigationNodes)}</p>
      <br />
      <br />
      <br />
      <br />
      {navigationNodes.map(value => (
        <p key={value.key}>
          {value.key}: {value.items.length} {'->'}{' '}
          {value.items.map(v => v.resourceType).join(', ')}
        </p>
      ))}
    </nav>
  );
};
