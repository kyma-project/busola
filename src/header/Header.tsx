import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  Avatar,
  ShellBar,
  ShellBarItem,
  StandardListItem,
} from '@ui5/webcomponents-react';
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
          <Avatar
            icon="customer"
            colorScheme="Accent10"
            accessibleName="Preferences"
          />
        }
        onProfileClick={() => setPreferencesOpen(true)}
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
      </ShellBar>
    </>
  );
}
