import React from 'react';
import { useRecoilState, useRecoilValueLoadable } from 'recoil';
import { SideNav } from 'fundamental-react';
import { sidebarNavigationNodesSelector } from 'state/navigation/sidebarNavigationNodesSelector';
import { expandedCategoriesState } from 'state/navigation/expandedCategoriesAtom';
import { CategoryItem } from './CategoryItem';
import { NavItem } from './NavItem';

export function SidebarNavigation() {
  const navigationNodes = useRecoilValueLoadable(
    sidebarNavigationNodesSelector,
  );

  // if it's in the CategoryItem, it causes needless re-renders
  const [expandedCategories, setExpandedCategories] = useRecoilState(
    expandedCategoriesState,
  );

  if (navigationNodes.state === 'loading') return <p>loading</p>;
  if (navigationNodes.state === 'hasError') return <p>error</p>;
  if (navigationNodes.state !== 'hasValue') return navigationNodes;

  const filteredNavigationNodes =
    navigationNodes.contents?.filter(nn => nn.items?.length > 0) || [];
  const topLevelNodes = filteredNavigationNodes?.filter(nn => nn.topLevelNode);
  const categoryNodes = filteredNavigationNodes?.filter(nn => !nn.topLevelNode);

  return (
    // TODO: Show children for condensed in fundamental
    // TODO: Remove 'TypeError: onItemSelect is not a function' errors in fundamental
    // TODO: Fix max width in fundamental
    <SideNav
      skipLink={{ href: '', label: 'Side navigation' }}
      style={{ width: '100%' }}
    >
      <SideNav.List>
        {topLevelNodes.map(node =>
          node.items?.map(item => <NavItem node={item} />),
        )}
        {categoryNodes.map(category => (
          <CategoryItem
            category={category}
            expandedCategories={expandedCategories}
            handleExpandedCategories={setExpandedCategories}
          />
        ))}
      </SideNav.List>
    </SideNav>
  );
}
