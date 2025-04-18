import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { NavNode } from 'state/types';
import { useUrl } from 'hooks/useUrl';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { clusterState } from 'state/clusterAtom';
import { columnLayoutState } from 'state/columnLayoutAtom';

import {
  SideNavigationItem,
  SideNavigationSubItem,
} from '@ui5/webcomponents-react';
import { useJsonata } from 'components/Extensibility/hooks/useJsonata';
import { Resource } from 'components/Extensibility/contexts/DataSources';
import { useFormNavigation } from 'shared/hooks/useFormNavigation';

type NavItemProps = {
  node: NavNode;
  subItem?: boolean;
};

export function NavItem({ node, subItem = false }: NavItemProps) {
  const { t } = useTranslation();
  const urlGenerators = useUrl();
  const navigate = useNavigate();
  const location = useLocation();
  const setLayoutColumn = useSetRecoilState(columnLayoutState);

  const { scopedUrl } = urlGenerators;
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const cluster = useRecoilValue(clusterState);

  const jsonata = useJsonata({ resource: {} as Resource });
  const [jsonataLink, jsonataError] = jsonata(node.externalUrl || '');
  const { navigateSafely } = useFormNavigation();

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
      return pathSegment === node.pathSegment;
    }
  };

  const handleNavigation = () => {
    if (node.dataSources) {
      let link =
        !jsonataError && jsonataLink ? jsonataLink : node.externalUrl ?? '';
      link = link.startsWith('http') ? link : `https://${link}`;
      const newWindow = window.open(link, 'noopener, noreferrer');
      if (newWindow) newWindow.opener = null;
    } else if (node.externalUrl) {
      const link = node.externalUrl.startsWith('http')
        ? node.externalUrl
        : `https://${node.externalUrl}`;
      const newWindow = window.open(link, 'noopener, noreferrer');
      if (newWindow) newWindow.opener = null;
    } else {
      navigateSafely(() => {
        const url = node.createUrlFn
          ? node.createUrlFn(urlGenerators)
          : scopedUrl(node.pathSegment);
        if (location?.pathname !== url) {
          setLayoutColumn({
            startColumn: {
              resourceType: node?.resourceTypeCased,
              resourceName: null,
              namespaceId: namespaceId,
              apiGroup: node?.apiGroup,
              apiVersion: node?.apiVersion,
            },
            midColumn: null,
            endColumn: null,
            layout: 'OneColumn',
          });
          navigate(url);
        }
      });
    }
  };

  const propsForNav = {
    icon: node.externalUrl ? 'action' : node.icon,
    text: t(node.label, { defaultValue: node.label }),
    selected: isNodeSelected(node),
    onClick: (e: Event) => {
      e.stopPropagation();
      handleNavigation();
    },
  };

  if (subItem) {
    return <SideNavigationSubItem key={node.pathSegment} {...propsForNav} />;
  }

  return <SideNavigationItem key={node.pathSegment} {...propsForNav} />;
}
