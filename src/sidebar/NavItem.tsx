import { SideNav } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Link as ExternalLink } from 'shared/components/Link/Link';

import { NavNode } from 'state/types';
import { useUrl } from 'hooks/useUrl';

import './NavItem.scss';
import { useRecoilValue } from 'recoil';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { clusterState } from 'state/clusterAtom';

type NavItemProps = {
  node: NavNode;
};

export function NavItem({ node }: NavItemProps) {
  const { t } = useTranslation();
  const urlGenerators = useUrl();
  const { scopedUrl } = urlGenerators;
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const cluster = useRecoilValue(clusterState);

  const isNodeSelected = () => {
    if (node.externalUrl) return false;
    else {
      const { pathname } = window.location;
      const namespacePart = namespaceId ? `/namespaces/${namespaceId}/` : '/';
      const resourcePart = pathname.replace(
        `/cluster/${cluster?.name}${namespacePart}`,
        '',
      );
      const pathSegment = resourcePart.split('/')?.[0];
      return (
        pathSegment === node.pathSegment || pathSegment === node.resourceType
      );
    }
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
        <ExternalLink
          className="nav-item__external-link"
          url={node.externalUrl}
        >
          {name}
        </ExternalLink>
      ) : (
        <Link
          to={
            node.createUrlFn
              ? node.createUrlFn(urlGenerators)
              : scopedUrl(node.pathSegment)
          }
        >
          {name}
        </Link>
      )}
    </SideNav.ListItem>
  );
}
