import { useRecoilValue } from 'recoil';
import { SideNav } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { NavNode } from 'state/types';
import { luigiNavigate } from 'resources/createResourceRoutes';

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
      name={t(node.label, { defaultValue: node.label })}
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
