import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useRef, useState } from 'react';
import {
  Avatar,
  Menu,
  MenuDomRef,
  ShellBar,
  ShellBarItem,
  StandardListItem,
} from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useMatch, useNavigate } from 'react-router-dom';

import { clustersState } from 'state/clustersAtom';
import { clusterState } from 'state/clusterAtom';
import { isPreferencesOpenState } from 'state/preferences/isPreferencesModalOpenAtom';
import { useUrl } from 'hooks/useUrl';

import { Logo } from './Logo/Logo';
import { NamespaceDropdown } from './NamespaceDropdown/NamespaceDropdown';
import { SidebarSwitcher } from './SidebarSwitcher/SidebarSwitcher';
import { useAvailableNamespaces } from 'hooks/useAvailableNamespaces';

import './Header.scss';
import { useFeature } from 'hooks/useFeature';
import { createPortal } from 'react-dom';

export function Header() {
  useAvailableNamespaces();

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { namespace: activeNamespace, clusterUrl, namespaceUrl } = useUrl();
  const { isEnabled: isFeedbackEnabled, link: feedbackLink } = useFeature(
    'FEEDBACK',
  );

  const setPreferencesOpen = useSetRecoilState(isPreferencesOpenState);
  const cluster = useRecoilValue(clusterState);
  const clusters = useRecoilValue(clustersState);

  const [isNamespaceOpen, setIsNamespaceOpen] = useState(false);

  const inactiveClusterNames = Object.keys(clusters || {}).filter(
    name => name !== cluster?.name,
  );

  const clustersList = [
    ...inactiveClusterNames.map((name, index) => {
      return (
        <StandardListItem
          data-key={index}
          onClick={e => {
            e.preventDefault();
            console.log('XDDDD');
          }}
        >
          {name}
        </StandardListItem>
      );
    }),
    <StandardListItem>
      {t('clusters.overview.title-all-clusters')}
    </StandardListItem>,
  ];

  const getNamespaceLabel = () => {
    if (activeNamespace === '-all-') return t('navigation.all-namespaces');
    else return activeNamespace || t('navigation.select-namespace');
  };

  const namespaceMenuRef = useRef<MenuDomRef>(null);
  const onNamespaceMenuClick = (e: any) => {
    setIsNamespaceOpen(!isNamespaceOpen);
    namespaceMenuRef.current?.showAt(e.detail.targetRef);
  };

  const { resourceType = '' } =
    useMatch({
      path: '/cluster/:cluster/namespaces/:namespace/:resourceType',
      end: false,
    })?.params ?? {};

  return (
    <>
      <ShellBar
        className="header"
        startButton={<SidebarSwitcher />}
        onLogoClick={() => navigate('/clusters')}
        logo={<Logo />}
        primaryTitle={cluster?.contextName || cluster?.name}
        menuItems={clustersList}
        onMenuItemClick={e =>
          e.detail.item.textContent ===
          t('clusters.overview.title-all-clusters')
            ? navigate('/clusters')
            : navigate(`/cluster/${e.detail.item.textContent}`)
        }
        profile={
          <Avatar
            icon="customer"
            colorScheme="Accent10"
            accessibleName="Preferences"
          />
        }
        onProfileClick={() => setPreferencesOpen(true)}
      >
        <ShellBarItem
          onClick={onNamespaceMenuClick}
          icon="add"
          text="Namespaces"
          id="openMenuBtn"
        />
        {createPortal(
          <Menu
            opener={'openMenuBtn'}
            open={isNamespaceOpen}
            ref={namespaceMenuRef}
            headerText={`Namespace: ${getNamespaceLabel()}`}
            onItemClick={e =>
              e.detail.item.text === t('namespaces.namespaces-overview')
                ? navigate(clusterUrl(`namespaces`))
                : e.detail.item.text === t('navigation.all-namespaces')
                ? navigate(namespaceUrl(resourceType, { namespace: '-all-' }))
                : navigate(
                    namespaceUrl(resourceType, {
                      namespace: e.detail.item.text,
                    }),
                  )
            }
          >
            <NamespaceDropdown />
          </Menu>,
          document.body,
        )}
        {isFeedbackEnabled && (
          <ShellBarItem
            onClick={() => window.open(feedbackLink, '_blank')}
            icon="feedback"
            text="Feedback"
          />
        )}
      </ShellBar>
    </>
  );
}
