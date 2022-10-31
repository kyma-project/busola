import { useRecoilValue } from 'recoil';
import { SideNav } from 'fundamental-react';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { luigiNavigate } from 'resources/createResourceRoutes';
import { NavNode } from 'state/types';
import { useHasTranslations } from './helpers';

export function NavItem({ node }: { node: NavNode }) {
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const hasTranslations = useHasTranslations();

  const pathSegments = window.location.pathname?.split('/') || [];
  const currentPath = pathSegments[pathSegments.length - 1];

  return (
    <SideNav.ListItem
      selected={currentPath === node.pathSegment}
      key={node.pathSegment}
      id={node.pathSegment}
      name={hasTranslations(node.label)}
      url="#"
      glyph={node.icon}
      onClick={() => luigiNavigate(node, namespaceId)}
    />
  );
}
