import { useRecoilValue } from 'recoil';
import { SideNav } from 'fundamental-react';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { luigiNavigate } from 'resources/createResourceRoutes';
import { NavNode } from 'state/types';
// import { useHasTranslations } from './helpers';
import { memo, useCallback } from 'react';
import { isEqual } from 'lodash';

export function NavItem({ node }: { node: NavNode }) {
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  // const hasTranslations = useHasTranslations();
  // console.log(node);
  const pathSegments = window.location.pathname?.split('/') || [];
  const currentPath = pathSegments[pathSegments.length - 1];

  const handleOnClick = useCallback(() => {
    luigiNavigate(node, namespaceId);
  }, [node, namespaceId]);

  return (
    <SideNav.ListItem
      selected={currentPath === node.pathSegment}
      key={node.pathSegment}
      id={node.pathSegment}
      // name={hasTranslations(node.label)}
      name={node.label}
      url="#"
      glyph={node.icon}
      onClick={handleOnClick}
    />
  );
}

const navNodesAreEqual = (prefNode: any, nextNode: any) => {
  return isEqual(prefNode, nextNode);
};

export const MemoizedNavItem = memo(NavItem, navNodesAreEqual);
