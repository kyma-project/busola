import React from 'react';
import { useRecoilState, useRecoilValueLoadable, useRecoilValue } from 'recoil';
import { SideNav } from 'fundamental-react';
// import { useRecoilValueLoadable } from 'recoil';
import { sidebarNavigationNodesSelector } from 'state/navigation/sidebarNavigationNodesSelector';
import { useTranslation } from 'react-i18next';
import { luigiNavigate } from 'resources/createResourceRoutes';
import { expandedCategoriesState } from 'state/navigation/expandedCategoriesAtom';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { NavNode } from 'state/types';
import { Category } from 'state/navigation/categories';
import { IconGlyph } from 'fundamental-react/lib/Icon/Icon';

export const SidebarNavigation = () => {
  const { i18n, t } = useTranslation();

  const navigationNodes = useRecoilValueLoadable(
    sidebarNavigationNodesSelector,
  );
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const [expandedCategories, setExpandedCategories] = useRecoilState(
    expandedCategoriesState,
  );

  if (navigationNodes.state === 'loading') return <p>loading</p>;
  if (navigationNodes.state === 'hasError') return <p>error</p>;
  if (navigationNodes.state !== 'hasValue') return navigationNodes;

  const filteredNavigationNodes =
    navigationNodes?.contents?.filter(nn => nn.items?.length > 0) || [];
  const topLevelNodes = filteredNavigationNodes?.filter(nn => nn.topLevelNode);
  const categoryNodes = filteredNavigationNodes?.filter(nn => !nn.topLevelNode);

  const hasTranslations = (translation: string) => {
    // TODO: add proper translations instead of returnObjects
    return i18n.exists(translation) &&
      typeof t(translation, { returnObjects: true }) !== 'object'
      ? t(translation)
      : translation;
  };

  const pathSegments = window.location.pathname?.split('/') || [];
  const currentPath = pathSegments[pathSegments.length - 1];

  const NavItem = ({ node }: { node: NavNode }) => {
    return (
      <SideNav.ListItem
        selected={currentPath === node.pathSegment}
        key={node.pathSegment}
        id={node.pathSegment}
        name={hasTranslations(node.label)}
        url="#"
        glyph={node.icon as IconGlyph}
        onClick={() => luigiNavigate(node, namespaceId)}
      />
    );
  };

  const CategoryItem = ({ node }: { node: Category }) => {
    return (
      <SideNav.ListItem
        key={node.key}
        expandSubmenuLabel={`Expand ${node.key || node.label} category`}
        id={node.key}
        name={hasTranslations(node.key || node.label)}
        url="#"
        glyph={(node.icon || 'customize') as IconGlyph}
        expanded={expandedCategories.includes(node.key)}
        onClick={() => {
          const wasExpanded = expandedCategories?.includes(node.key);
          let newExpandedCategories = [...expandedCategories];
          if (wasExpanded) {
            newExpandedCategories = newExpandedCategories?.filter(
              el => el !== node.key,
            );
          } else {
            newExpandedCategories?.push(node.key);
          }
          setExpandedCategories(newExpandedCategories);
        }}
      >
        <SideNav.List level={2}>
          {node.items?.map(nn => (
            <NavItem node={nn} />
          ))}
        </SideNav.List>
      </SideNav.ListItem>
    );
  };

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
        {categoryNodes.map(node => (
          <CategoryItem node={node} />
        ))}
      </SideNav.List>
    </SideNav>
  );
};
