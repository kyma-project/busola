import React from 'react';
import { SideNav } from 'fundamental-react';
import { useRecoilValueLoadable } from 'recoil';
import { sidebarNavigationNodesSelector } from 'state/navigation/sidebarNavigationNodesSelector';
import { useTranslation } from 'react-i18next';

export const SidebarNavigation = () => {
  const { i18n, t } = useTranslation();
  const navigationNodes = useRecoilValueLoadable(
    sidebarNavigationNodesSelector,
  );

  if (navigationNodes.state === 'loading') return 'loading';
  if (navigationNodes.state === 'hasError') return 'error';
  if (navigationNodes.state !== 'hasValue') return navigationNodes;

  const filteredNavigationNodes =
    navigationNodes?.contents?.filter(nn => nn.items?.length > 0) || [];
  const topLevelNodes = filteredNavigationNodes?.filter(nn => nn.topLevelNode);
  const categoryNodes = filteredNavigationNodes?.filter(nn => !nn.topLevelNode);

  const hasTranslations = translation => {
    //add proper translations instead of returnObjects
    return i18n.exists(translation) &&
      typeof t(translation, { returnObjects: true }) !== 'object'
      ? t(translation)
      : translation;
  };
  const NavItem = ({ node }) => {
    return (
      <SideNav.ListItem
        id={node.key}
        name={hasTranslations(node.label)}
        url="#"
        glyph={node.icon}
      />
    );
  };

  const CategoryItem = ({ node }) => {
    return (
      <SideNav.ListItem
        expandSubmenuLabel={`Expand ${node.key || node.label} category`}
        id={node.key}
        name={hasTranslations(node.key || node.label)}
        url="#"
        glyph={node.icon || 'customize'}
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
    <SideNav skipLink={{ href: '', label: 'Side navigation' }}>
      {topLevelNodes.map(node =>
        node.items?.map(item => <NavItem node={item} />),
      )}
      {categoryNodes.map(node => (
        <CategoryItem node={node} />
      ))}
    </SideNav>
  );
};
