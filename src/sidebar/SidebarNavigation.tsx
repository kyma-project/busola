import { useRecoilState, useRecoilValue } from 'recoil';
import {
  Button,
  MenuDomRef,
  SideNavigation,
  Menu,
  MenuItem,
} from '@ui5/webcomponents-react';
import { sidebarNavigationNodesSelector } from 'state/navigation/sidebarNavigationNodesSelector';
import { expandedCategoriesSelector } from 'state/navigation/expandedCategories/expandedCategoriesSelector';
import { CategoryItem } from './CategoryItem';
import { NavItem } from './NavItem';
import { isSidebarCondensedState } from 'state/preferences/isSidebarCondensedAtom';
import { useRef, useState } from 'react';
import { NamespaceDropdown } from 'header/NamespaceDropdown/NamespaceDropdown';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';

export function SidebarNavigation() {
  const navigationNodes = useRecoilValue(sidebarNavigationNodesSelector);
  const isSidebarCondensed = useRecoilValue(isSidebarCondensedState);
  const namespace = useRecoilValue(activeNamespaceIdState);

  const dialogRef = useRef<MenuDomRef>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const onButtonClick = (e: any) => {
    setMenuOpen(!menuOpen);
    console.log('test');
    dialogRef.current?.showAt(e.detail.targetRef);
  };

  // if it's in the CategoryItem, it causes needless re-renders
  const [expandedCategories, setExpandedCategories] = useRecoilState(
    expandedCategoriesSelector,
  );

  const filteredNavigationNodes =
    navigationNodes.filter(nn => nn.items?.length > 0) || [];
  const topLevelNodes = filteredNavigationNodes?.filter(nn => nn.topLevelNode);
  const categoryNodes = filteredNavigationNodes?.filter(nn => !nn.topLevelNode);

  return (
    <>
      <SideNavigation
        collapsed={isSidebarCondensed}
        onSelectionChange={e => e.preventDefault()}
        header={
          <>
            <Button id="menu" onClick={onButtonClick}>
              NAMESPACES
            </Button>
            <Menu
              opener={'openMenuBtn'}
              open={menuOpen}
              ref={dialogRef}
              headerText={`${namespace}`}

              // onItemClick={e =>
              //   e.detail.item.text === t('namespaces.namespaces-overview')
              //     ? navigate(clusterUrl(`namespaces`))
              //     : e.detail.item.text === t('navigation.all-namespaces')
              //     ? navigate(namespaceUrl(resourceType, { namespace: '-all-' }))
              //     : navigate(
              //         namespaceUrl(resourceType, {
              //           namespace: e.detail.item.text,
              //         }),
              //       )
              // }
            >
              <NamespaceDropdown />
            </Menu>
          </>
        }
      >
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
      </SideNavigation>
    </>
  );
}
