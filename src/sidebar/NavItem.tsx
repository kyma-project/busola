import { useTranslation } from 'react-i18next';
import { NavNode } from 'state/types';
import { useUrl } from 'hooks/useUrl';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { clusterState } from 'state/clusterAtom';
import { columnLayoutState } from 'state/columnLayoutAtom';

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
  const setLayoutColumn = useSetRecoilState(columnLayoutState);

  const { scopedUrl } = urlGenerators;
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const cluster = useRecoilValue(clusterState);

  const isNodeSelected = (node: NavNode) => {
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

  let propsForNav = {
    icon: node.externalUrl ? 'action' : node.icon,
    text: t(node.label, { defaultValue: node.label }),
    selected: isNodeSelected(node),
    key: node.pathSegment,
    onClick: (e: Event) => {
      if (node.externalUrl) {
        const newWindow = window.open(
          node.externalUrl,
          '_blank',
          'noopener, noreferrer',
        );
        if (newWindow) newWindow.opener = null;
      } else {
        setLayoutColumn({
          midColumn: null,
          endColumn: null,
          layout: 'OneColumn',
        });
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
