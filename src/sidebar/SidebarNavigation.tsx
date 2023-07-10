import { useRecoilState, useRecoilValue } from 'recoil';
import { SideNav } from 'fundamental-react';
import { sidebarNavigationNodesSelector } from 'state/navigation/sidebarNavigationNodesSelector';
import { expandedCategoriesSelector } from 'state/navigation/expandedCategories/expandedCategoriesSelector';
import { CategoryItem } from './CategoryItem';
import { NavItem } from './NavItem';
import { isSidebarCondensedState } from 'state/preferences/isSidebarCondensedAtom';

export function SidebarNavigation() {
  const navigationNodes = useRecoilValue(sidebarNavigationNodesSelector);
  const isSidebarCondensed = useRecoilValue(isSidebarCondensedState);

  // if it's in the CategoryItem, it causes needless re-renders
  const [expandedCategories, setExpandedCategories] = useRecoilState(
    expandedCategoriesSelector,
  );

  const filteredNavigationNodes =
    navigationNodes.filter(nn => nn.items?.length > 0) || [];
  const topLevelNodes = filteredNavigationNodes?.filter(nn => nn.topLevelNode);
  const categoryNodes = filteredNavigationNodes?.filter(nn => !nn.topLevelNode);

  return (
    <SideNav
      skipLink={{ href: '', label: 'Side navigation' }}
      style={{ width: '100%' }}
      condensed={isSidebarCondensed}
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
            isSidebarCondensed={isSidebarCondensed}
          />
        ))}
      </SideNav.List>
    </SideNav>
  );
}
