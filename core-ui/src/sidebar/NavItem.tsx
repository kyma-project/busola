import { useRecoilValue } from 'recoil';
import { Icon, SideNav } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { NavNode } from 'state/types';
import { luigiNavigate } from 'resources/createResourceRoutes';

import './NavItem.scss';

type NavItemProps = {
  node: NavNode;
};

export function NavItem({ node }: NavItemProps) {
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const { t } = useTranslation();

  const isNodeSelected = () => {
    if (node.externalUrl) return false;
    const { pathname } = window.location;
    const namespacePart = namespaceId ? `/namespaces/${namespaceId}/` : '/';
    const resourcePart = pathname.replace(namespacePart, '');
    const pathSegment = resourcePart.split('/')?.[0];
    return (
      pathSegment === node.pathSegment || pathSegment === node.resourceType
    );
  };

  // TODO: Show it's external node - implemented in fd, types dont match
  return (
    <SideNav.ListItem
      selected={isNodeSelected()}
      key={node.pathSegment}
      id={node.pathSegment}
      // @ts-ignore
      name={
        <span className={node.externalUrl ? 'nav-item__external-link' : ''}>
          {t(node.label, { defaultValue: node.label })}
          {node.externalUrl && <Icon glyph="inspect" />}
        </span>
      }
      url="#"
      glyph={node.icon}
      onClick={() => {
        if (node.externalUrl) {
          window.open(node.externalUrl, '_blank', 'noopener,noreferrer');
        } else {
          luigiNavigate(node, namespaceId);
        }
      }}
    />
  );
}
