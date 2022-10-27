import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { SideNav } from 'fundamental-react';
import { useRecoilValueLoadable } from 'recoil';
import { sidebarNavigationNodesSelector } from 'state/navigation/sidebarNavigationNodesSelector';
import { useTranslation } from 'react-i18next';
import { luigiNavigate } from 'resources/createResourceRoutes';
import { expandedCategoriesState } from 'state/navigation/expandedCategoriesAtom';
import { activeClusterNameState } from 'state/activeClusterNameAtom';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

export const SidebarNavigation = () => {
  const { namespaceId } = useMicrofrontendContext();
  const { i18n, t } = useTranslation();
  const navigationNodes = useRecoilValueLoadable(
    sidebarNavigationNodesSelector,
  );

  const fakeExpandedCategories = ['Istio', 'Workloads'];
  const [expandedCategories, setExpandedCategories] = useRecoilState(
    expandedCategoriesState,
  );

  if (navigationNodes.state === 'loading') return 'loading';
  if (navigationNodes.state === 'hasError') return 'error';
  if (navigationNodes.state !== 'hasValue') return navigationNodes;

  const filteredNavigationNodes =
    navigationNodes?.contents?.filter(nn => nn.items?.length > 0) || [];
  const topLevelNodes = filteredNavigationNodes?.filter(nn => nn.topLevelNode);
  const categoryNodes = filteredNavigationNodes?.filter(nn => !nn.topLevelNode);

  const hasTranslations = translation => {
    // TODO: add proper translations instead of returnObjects
    return i18n.exists(translation) &&
      typeof t(translation, { returnObjects: true }) !== 'object'
      ? t(translation)
      : translation;
  };

  const NavItem = ({ node }) => {
    return (
      <SideNav.ListItem
        key={node.pathSegment}
        id={node.pathSegment}
        name={hasTranslations(node.label)}
        url="#"
        glyph={node.icon}
        onClick={() => luigiNavigate(node, namespaceId)}
      />
    );
  };

  const CategoryItem = ({ node }) => {
    return (
      <SideNav.ListItem
        key={node.key}
        expandSubmenuLabel={`Expand ${node.key || node.label} category`}
        id={node.key}
        name={hasTranslations(node.key || node.label)}
        url="#"
        glyph={node.icon || 'customize'}
        expanded={expandedCategories?.includes(node.key)}
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
            <NavItem node={nn} key={node.key} />
          ))}
        </SideNav.List>
      </SideNav.ListItem>
    );
  };

  const pathSegments = window.location.pathname?.split('/') || [];
  const selectedId = pathSegments[pathSegments.length - 1];
  return (
    // TODO: Show children for condensed in fundamental
    // TODO: Selected id doesn't work
    <SideNav
      selectedId={selectedId}
      skipLink={{ href: '', label: 'Side navigation' }}
    >
      <SideNav.List>
        {topLevelNodes.map(node =>
          node.items?.map(item => <NavItem node={item} />),
        )}
        {categoryNodes.map(node => (
          <CategoryItem node={node} key={node.key} />
        ))}
      </SideNav.List>
    </SideNav>
  );
};
