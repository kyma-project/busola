import React from 'react';
import { useRecoilValueLoadable } from 'recoil';
import { SideNav } from 'fundamental-react';
import { sidebarNavigationNodesSelector } from 'state/navigation/sidebarNavigationNodesSelector';
import { CategoryItem } from './CategoryItem';
import { NavItem } from './NavItem';

export function SidebarNavigation() {
  const navigationNodes = useRecoilValueLoadable(
    sidebarNavigationNodesSelector,
  );

  if (navigationNodes.state === 'loading') return <p>loading</p>;
  if (navigationNodes.state === 'hasError') return <p>error</p>;
  if (navigationNodes.state !== 'hasValue') return navigationNodes;

  const filteredNavigationNodes =
    navigationNodes?.contents?.filter(nn => nn.items?.length > 0) || [];
  const topLevelNodes = filteredNavigationNodes?.filter(nn => nn.topLevelNode);
  const categoryNodes = filteredNavigationNodes?.filter(nn => !nn.topLevelNode);

  return (
    // TODO: Show children for condensed in fundamental
    // TODO: Selected id doesn't work
    // TODO: Remove 'TypeError: onItemSelect is not a function' errors in fundamental
    // TODO: Fix max width in fundamental
    <SideNav skipLink={{ href: '', label: 'Side navigation' }}>
      <SideNav.List>
        {topLevelNodes.map(node =>
          node.items?.map(item => <NavItem node={item} />),
        )}
        {categoryNodes.map(category => (
          <CategoryItem category={category} />
        ))}
      </SideNav.List>
    </SideNav>
  );
}
