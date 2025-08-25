import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { NavNode } from 'state/types';
import { useUrl } from 'hooks/useUrl';

import { useAtomValue, useSetAtom } from 'jotai';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';
import { clusterAtom } from 'state/clusterAtom';
import { columnLayoutAtom } from 'state/columnLayoutAtom';

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
  const setLayoutColumn = useSetAtom(columnLayoutAtom);

  const { scopedUrl } = urlGenerators;
  const namespaceId = useAtomValue(activeNamespaceIdAtom);
  const cluster = useAtomValue(clusterAtom);

  const emptyResource = useMemo(() => ({} as Resource), []);
  const jsonata = useJsonata({ resource: emptyResource });
  const [jsonataLink, setJsonataLink] = useState('');
  const [jsonataError, setJsonataError] = useState<Error | null>(null);
  const { navigateSafely } = useFormNavigation();

  useEffect(() => {
    jsonata(node.externalUrl || '').then(([link, error]) => {
      setJsonataLink(link);
      setJsonataError(error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.externalUrl]);

  const isSelected = useMemo(() => {
    if (node.externalUrl) return false;
    const namespacePart = namespaceId ? `/namespaces/${namespaceId}/` : '/';
    const resourcePart = location.pathname.replace(
      `/cluster/${cluster?.name}${namespacePart}`,
      '',
    );
    const pathSegment = resourcePart.split('/')?.[0];
    return pathSegment === node.pathSegment;
  }, [
    node.externalUrl,
    node.pathSegment,
    location.pathname,
    namespaceId,
    cluster?.name,
  ]);

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
              rawResourceTypeName: node?.resourceTypeCased,
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
    selected: isSelected,
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
