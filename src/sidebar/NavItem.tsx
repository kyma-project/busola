import { useTranslation } from 'react-i18next';
import { NavNode } from 'state/types';
import { useUrl } from 'hooks/useUrl';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { clusterState } from 'state/clusterAtom';
import { columnLayoutState } from 'state/columnLayoutAtom';

import {
  SideNavigationSubItem,
  SideNavigationItem,
} from '@ui5/webcomponents-react';
import { useNavigate } from 'react-router-dom';
import { isResourceEditedState } from 'state/resourceEditedAtom';

import { isFormOpenState } from 'state/formOpenAtom';
import { handleActionIfFormOpen } from 'shared/components/UnsavedMessageBox/helpers';
import { useJsonata } from 'components/Extensibility/hooks/useJsonata';
import { Resource } from 'components/Extensibility/contexts/DataSources';

type NavItemProps = {
  node: NavNode;
  subItem?: boolean;
};

export function NavItem({ node, subItem = false }: NavItemProps) {
  const { t } = useTranslation();
  const urlGenerators = useUrl();
  const navigate = useNavigate();
  const setLayoutColumn = useSetRecoilState(columnLayoutState);
  const [isResourceEdited, setIsResourceEdited] = useRecoilState(
    isResourceEditedState,
  );
  const [isFormOpen, setIsFormOpen] = useRecoilState(isFormOpenState);

  const { scopedUrl } = urlGenerators;
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const cluster = useRecoilValue(clusterState);

  const jsonata = useJsonata({ resource: {} as Resource });
  const [jsonataLink] = jsonata(node.externalUrl || '');

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

  let propsForNav = {
    icon: node.externalUrl ? 'action' : node.icon,
    text: t(node.label, { defaultValue: node.label }),
    selected: isNodeSelected(node),
    key: node.pathSegment,
    onClick: (e: Event) => {
      if (node.dataSources) {
        let link = jsonataLink || node.externalUrl || '';
        link = link.startsWith('http') ? link : `https://${link}`;
        const newWindow = window.open(link, 'noopener, noreferrer');
        if (newWindow) newWindow.opener = null;
      } else if (node.externalUrl) {
        const newWindow = window.open(node.externalUrl, 'noopener, noreferrer');
        if (newWindow) newWindow.opener = null;
      } else {
        handleActionIfFormOpen(
          isResourceEdited,
          setIsResourceEdited,
          isFormOpen,
          setIsFormOpen,
          () => {
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
          },
        );
      }
    },
  };

  if (subItem) {
    return <SideNavigationSubItem {...propsForNav} />;
  }

  return <SideNavigationItem {...propsForNav} />;
}
