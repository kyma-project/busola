import React, { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  Avatar,
  Menu,
  MenuItem,
  Ui5CustomEvent,
  MenuDomRef,
  ShellBar,
  ShellBarItem,
  StandardListItem,
} from '@ui5/webcomponents-react';
import { MenuItemClickEventDetail } from '@ui5/webcomponents/dist/Menu.js';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useFeature } from 'hooks/useFeature';
import { showYamlUploadDialogState } from 'state/showYamlUploadDialogAtom';

import { clustersState } from 'state/clustersAtom';
import { clusterState } from 'state/clusterAtom';
import { isPreferencesOpenState } from 'state/preferences/isPreferencesModalOpenAtom';

import { Logo } from './Logo/Logo';
import { SidebarSwitcher } from './SidebarSwitcher/SidebarSwitcher';
import { useAvailableNamespaces } from 'hooks/useAvailableNamespaces';

import './Header.scss';

export function Header() {
  useAvailableNamespaces();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isEnabled: isFeedbackEnabled, link: feedbackLink } = useFeature(
    'FEEDBACK',
  );

  const setPreferencesOpen = useSetRecoilState(isPreferencesOpenState);
  const cluster = useRecoilValue(clusterState);
  const clusters = useRecoilValue(clustersState);

  const setShowAdd = useSetRecoilState(showYamlUploadDialogState);

  const inactiveClusterNames = Object.keys(clusters || {}).filter(
    name => name !== cluster?.name,
  );

  const clustersList = [
    ...inactiveClusterNames.map((name, index) => {
      return (
        <StandardListItem aria-label={name} data-key={index}>
          {name}
        </StandardListItem>
      );
    }),
    <StandardListItem aria-label="all-clusters">
      {t('clusters.overview.title-all-clusters')}
    </StandardListItem>,
  ];

  const handleMenuItemClick = (
    e: Ui5CustomEvent<MenuDomRef, MenuItemClickEventDetail>,
  ) => {
    console.log('clicked', e.detail.text);
  };

  return (
    <>
      <ShellBar
        className="header"
        startButton={
          window.location.pathname !== '/clusters' && <SidebarSwitcher />
        }
        onLogoClick={() => navigate('/clusters')}
        logo={<Logo />}
        primaryTitle={
          window.location.pathname !== '/clusters'
            ? cluster?.contextName || cluster?.name
            : ''
        }
        menuItems={window.location.pathname !== '/clusters' ? clustersList : []}
        onMenuItemClick={e =>
          e.detail.item.textContent ===
          t('clusters.overview.title-all-clusters')
            ? navigate('/clusters')
            : navigate(`/cluster/${e.detail.item.textContent}`)
        }
        profile={
          <>
            <Avatar
              icon="customer"
              colorScheme="Accent6"
              accessibleName="Preferences"
              id={'openShellbarMenu'}
            />

            {/* <Button
              id={'openMenuBtn'}
              onClick={() => {
                setIsMenuOpen(true);
              }}
            >
              Open Action Sheet
            </Button> */}
          </>
        }
        onProfileClick={() => setIsMenuOpen(true)}
      >
        {window.location.pathname !== '/clusters' &&
          !window.location.pathname.endsWith('/no-permissions') && (
            <ShellBarItem
              onClick={() => setShowAdd(true)}
              icon="add"
              text="Upload YAML"
            />
          )}
        {isFeedbackEnabled && (
          <ShellBarItem
            onClick={() => window.open(feedbackLink, '_blank')}
            icon="feedback"
            text="Feedback"
          />
        )}
        {/* <ShellBarItem
          onClick={(handleShellBarItemClick)} icon="add"
          text="open MENU"
        /> */}
      </ShellBar>
      <Menu
        open={isMenuOpen}
        opener={'openShellbarMenu'}
        onAfterClose={() => {
          setIsMenuOpen(false);
        }}
        onItemClick={handleMenuItemClick}
      >
        <MenuItem
          onClick={() => setPreferencesOpen(true)}
          key="preferences"
          text="Preferences"
          icon="wrench"
        />
        <MenuItem
          onClick={() => {
            console.log('clicked feedback');
          }}
          key="give-feedback"
          text="Give Feedback"
          icon="feedback"
        />
        <MenuItem
          onClick={() => {
            console.log('clicked feedback');
          }}
          key="get-help"
          text="Get Help"
          icon="sys-help"
        >
          <MenuItem
            onClick={() => {
              console.log('clicked feedback');
            }}
            key="kyma-project-io"
            text="kyma-project.io"
          />
          <MenuItem
            onClick={() => {
              console.log('clicked feedback');
            }}
            key="help-sap-com"
            text="help.sap.com"
          />
        </MenuItem>
        <MenuItem
          onClick={() => {
            console.log('clicked feedback');
          }}
          key="legal-information"
          text="Legal Information"
          icon="official-service"
        >
          <MenuItem
            onClick={() => {
              console.log('clicked feedback');
            }}
            key="kyma-project-io"
            text="kyma-project.io"
          />
          <MenuItem
            onClick={() => {
              console.log('clicked feedback');
            }}
            key="help-sap-com"
            text="help.sap.com"
          />
        </MenuItem>
      </Menu>
      {/* <Popover ref={popoverRef}>Hello there!</Popover> */}
    </>
  );
}
