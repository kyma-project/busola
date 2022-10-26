import React from 'react';
import { useRecoilValue, useRecoilValueLoadable } from 'recoil';
import { sidebarNavigationNodesSelector } from 'state/navigation/sidebarNavigationNodesSelector';
import { openapiPathIdListSelector } from 'state/openapi/openapiPathIdSelector';

export const SidebarNavigation = () => {
  const navigationNodes = useRecoilValueLoadable(
    sidebarNavigationNodesSelector,
  );
  // const aaa = useRecoilValue(openapiPathIdListSelector);

  switch (navigationNodes.state) {
    case 'hasValue':
      return (
        <nav>
          <p>{JSON.stringify(navigationNodes.contents)}</p>
          <br />
          <br />
          <br />
          <br />
          {navigationNodes.contents.map(value => (
            <p key={value.key}>
              {value.key}: {value.items.length} {'->'}{' '}
              {value.items.map(v => v.resourceType).join(', ')}
            </p>
          ))}
        </nav>
      );
    case 'loading':
      return <div>Loading...</div>;
    case 'hasError':
    default:
      throw navigationNodes.contents;
  }
};
