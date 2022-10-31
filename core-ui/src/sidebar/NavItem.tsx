import { useRecoilValue } from 'recoil';
import { SideNav } from 'fundamental-react';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { luigiNavigate } from 'resources/createResourceRoutes';
import { NavNode } from 'state/types';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
// import { isEqual } from 'lodash';

export function NavItem({ node }: { node: NavNode }) {
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const { t } = useTranslation();

  console.log(node);
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
      name={t(node.label, { defaultValue: node.label })}
      url="#"
      glyph={node.icon}
      onClick={handleOnClick}
    />
  );
}

const navNodesAreEqual = (prevNode: any, nextNode: any) => {
  return (
    prevNode.pathSegment === nextNode.pathSegment &&
    prevNode.category === nextNode.category
  );
};

export const MemoizedNavItem = memo(NavItem, navNodesAreEqual);
