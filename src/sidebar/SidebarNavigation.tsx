import { useRecoilState, useRecoilValue } from 'recoil';
import {
  SideNavigation,
  SideNavigationItem,
  ShellBar,
} from '@ui5/webcomponents-react';
import { sidebarNavigationNodesSelector } from 'state/navigation/sidebarNavigationNodesSelector';
import { expandedCategoriesSelector } from 'state/navigation/expandedCategories/expandedCategoriesSelector';
import { CategoryItem } from './CategoryItem';
import { NavItem } from './NavItem';
import { isSidebarCondensedState } from 'state/preferences/isSidebarCondensedAtom';
import { NamespaceDropdown } from 'header/NamespaceDropdown/NamespaceDropdown';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { useTranslation } from 'react-i18next';
import { useMatch, useNavigate } from 'react-router';
import { useUrl } from 'hooks/useUrl';
import { Footer } from './Footer/Footer';

export function SidebarNavigation() {
  const navigationNodes = useRecoilValue(sidebarNavigationNodesSelector);
  const isSidebarCondensed = useRecoilValue(isSidebarCondensedState);
  const namespace = useRecoilValue(activeNamespaceIdState);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { clusterUrl, namespaceUrl } = useUrl();
  const { resourceType = '' } =
    useMatch({
      path: '/cluster/:cluster/namespaces/:namespace/:resourceType',
      end: false,
    })?.params ?? {};

  const getNamespaceLabel = () => {
    if (namespace === '-all-') return t('navigation.all-namespaces');
    else return namespace || t('navigation.select-namespace');
  };

  // if it's in the CategoryItem, it causes needless re-renders
  const [expandedCategories, setExpandedCategories] = useRecoilState(
    expandedCategoriesSelector,
  );

  const filteredNavigationNodes =
    navigationNodes.filter(nn => nn.items?.length > 0) || [];
  const topLevelNodes = filteredNavigationNodes?.filter(nn => nn.topLevelNode);
  const categoryNodes = filteredNavigationNodes?.filter(nn => !nn.topLevelNode);

  const isClusterOverviewSelected = () => {
    const { pathname } = window.location;
    if (pathname.includes('overview') && !pathname.includes('namespaces'))
      return true;
    else return false;
  };

  return (
    <>
      <SideNavigation
        collapsed={isSidebarCondensed}
        onSelectionChange={e => e.preventDefault()}
        fixedItems={<Footer />}
        header={
          <>
            <SideNavigation
              className="nested-navigation"
              style={{ height: 'auto', width: 'auto' }}
            >
              <SideNavigationItem
                icon={namespace ? 'slim-arrow-left' : 'database'}
                text={namespace ? 'Back To Cluster Details' : 'Cluster Details'}
                onClick={() => navigate(clusterUrl(`overview`))}
                selected={isClusterOverviewSelected()}
              ></SideNavigationItem>
            </SideNavigation>
            <div className="sidebar-namespaces">
              <ShellBar
                style={namespace ? {} : { display: 'none' }}
                menuItems={NamespaceDropdown()}
                onMenuItemClick={e =>
                  e.detail.item.textContent ===
                  t('namespaces.namespaces-overview')
                    ? navigate(clusterUrl(`namespaces`))
                    : e.detail.item.textContent ===
                      t('navigation.all-namespaces')
                    ? navigate(
                        namespaceUrl(resourceType, { namespace: '-all-' }),
                      )
                    : navigate(
                        namespaceUrl(resourceType, {
                          namespace: e.detail.item.textContent ?? undefined,
                        }),
                      )
                }
                primaryTitle={getNamespaceLabel()}
              ></ShellBar>
            </div>
          </>
        }
      >
        {isSidebarCondensed && (
          <SideNavigationItem
            icon={namespace ? 'slim-arrow-left' : 'database'}
            text={namespace ? 'Back To Cluster Details' : 'Cluster Details'}
            onClick={() => navigate(clusterUrl(`overview`))}
            selected={isClusterOverviewSelected()}
          />
        )}
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
