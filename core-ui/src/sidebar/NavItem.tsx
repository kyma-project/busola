import { useRecoilValue } from 'recoil';
import { Icon, SideNav } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { NavNode } from 'state/types';
import { useUrl } from 'hooks/useUrl';
import { Link } from 'react-router-dom';

import './NavItem.scss';

type NavItemProps = {
  node: NavNode;
};

export function NavItem({ node }: NavItemProps) {
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const { t } = useTranslation();
  const { scopedUrl } = useUrl();

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

  const name = t(node.label, { defaultValue: node.label });

  return (
    <SideNav.ListItem
      selected={isNodeSelected()}
      key={node.pathSegment}
      id={node.pathSegment}
      glyph={node.icon}
    >
      {node.externalUrl ? (
        <a className="nav-item__external-link" href={node.externalUrl}>
          {name} <Icon glyph="inspect" />
        </a>
      ) : (
        <Link to={scopedUrl(node.pathSegment)}>{name}</Link>
      )}
    </SideNav.ListItem>
  );
}
