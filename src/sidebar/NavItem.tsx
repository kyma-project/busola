import { RefObject, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { NavNode } from 'state/types';
import { useUrl } from 'hooks/useUrl';

import { useAtomValue, useSetAtom } from 'jotai';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';
import { clusterAtom } from 'state/clusterAtom';
import { columnLayoutAtom } from 'state/columnLayoutAtom';

import {
  SideNavigationDomRef,
  SideNavigationItem,
  SideNavigationSubItem,
} from '@ui5/webcomponents-react';
import { useJsonata } from 'components/Extensibility/hooks/useJsonata';
import { Resource } from 'components/Extensibility/contexts/DataSources';
import { useFormNavigation } from 'shared/hooks/useFormNavigation';

type NavItemProps = {
  node: NavNode;
  subItem?: boolean;
  sidebarRef: RefObject<SideNavigationDomRef & { closePicker: () => void }>;
  isSelected?: boolean;
};

export function NavItem({
  node,
  subItem = false,
  sidebarRef,
  isSelected,
}: NavItemProps) {
  const { t } = useTranslation();
  const urlGenerators = useUrl();
  const navigate = useNavigate();
  const location = useLocation();
  const setLayoutColumn = useSetAtom(columnLayoutAtom);

  const { scopedUrl } = urlGenerators;
  const namespaceId = useAtomValue(activeNamespaceIdAtom);
  const cluster = useAtomValue(clusterAtom);

  const emptyResource = useMemo(() => ({}) as Resource, []);
  const jsonata = useJsonata({ resource: emptyResource });
  const [jsonataLink, setJsonataLink] = useState<string | null>('');
  const [jsonataError, setJsonataError] = useState<Error | null>(null);

  const { navigateSafely } = useFormNavigation();

  useEffect(() => {
    if (!node.externalUrl) {
      const timeoutId = setTimeout(() => {
        setJsonataLink('');
        setJsonataError(null);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
      };
    }

    jsonata(node.externalUrl).then(([link, error]) => {
      setJsonataLink(link || '');
      setJsonataError(error);
    });
  }, [node.externalUrl, emptyResource, jsonata]);

  const selected = useMemo(() => {
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
    if (node.dataSources || node.externalUrl) {
      const link = getURL();
      const newWindow = window.open(link, '_blank', 'noopener,noreferrer');
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

  const getURL = () => {
    let link;
    if (node.dataSources) {
      link =
        !jsonataError && jsonataLink ? jsonataLink : (node.externalUrl ?? '');
      link = link.startsWith('http') ? link : `https://${link}`;
    } else if (node.externalUrl) {
      link = node.externalUrl.startsWith('http')
        ? node.externalUrl
        : `https://${node.externalUrl}`;
    }
    return link || undefined;
  };

  const propsForNav = {
    icon: node.externalUrl ? 'action' : node.icon,
    text: t(node.label, { defaultValue: node.label }),
    selected: isSelected ?? selected,
    href: node.dataSources || node.externalUrl ? getURL() : undefined,
    onClick: (e: Event) => {
      e.preventDefault();
      sidebarRef?.current?.closePicker();

      e.stopPropagation();
      handleNavigation();
    },
  };

  if (subItem) {
    return <SideNavigationSubItem key={node.pathSegment} {...propsForNav} />;
  }

  return <SideNavigationItem key={node.pathSegment} {...propsForNav} />;
}
