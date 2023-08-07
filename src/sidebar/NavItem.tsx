import { useTranslation } from 'react-i18next';
import { NavNode } from 'state/types';
import { useUrl } from 'hooks/useUrl';

import { useRecoilValue } from 'recoil';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { clusterState } from 'state/clusterAtom';
import {
  SideNavigationSubItem,
  SideNavigationItem,
} from '@ui5/webcomponents-react';
import { useNavigate } from 'react-router-dom';

type NavItemProps = {
  node: NavNode;
  subItem?: boolean;
};

export function NavItem({ node, subItem = false }: NavItemProps) {
  const { t } = useTranslation();
  const urlGenerators = useUrl();
  const navigate = useNavigate();

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

  let propsForNav = {
    icon: node.icon,
    text: name,
    selected: isNodeSelected(),
    key: node.pathSegment,
    onClick: (e: Event) => {
      e.preventDefault();

      if (node.externalUrl) {
        const newWindow = window.open(
          node.externalUrl,
          '_blank',
          'noopener, noreferrer',
        );
        if (newWindow) newWindow.opener = null;
      } else {
        navigate(
          node.createUrlFn
            ? node.createUrlFn(urlGenerators)
            : scopedUrl(node.pathSegment),
        );
      }
    },
  };

  if (subItem) {
    return <SideNavigationSubItem {...propsForNav} />;
  }

  return <SideNavigationItem {...propsForNav} />;
}
