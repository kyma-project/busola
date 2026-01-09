import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  Button,
  List,
  ListItemStandard,
  Popover,
} from '@ui5/webcomponents-react';

import { clustersAtom } from 'state/clustersAtom';
import { clusterAtom } from 'state/clusterAtom';
import { showKymaCompanionAtom } from 'state/companion/showKymaCompanionAtom';
import { useFormNavigation } from 'shared/hooks/useFormNavigation';
import './ClusterSwitcher.scss';

export function ClusterSwitcher() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { navigateSafely } = useFormNavigation();

  const cluster = useAtomValue(clusterAtom);
  const clusters = useAtomValue(clustersAtom);
  const setShowCompanion = useSetAtom(showKymaCompanionAtom);

  const [isOpen, setIsOpen] = useState(false);

  const isOnClustersPage = location.pathname === '/clusters';

  const inactiveClusterNames = Object.keys(clusters || {}).filter(
    (name) => name !== cluster?.name,
  );

  const title = !isOnClustersPage ? cluster?.contextName || cluster?.name : '';

  if (!title) {
    return null;
  }

  const handleItemClick = (clusterName: string) => {
    navigateSafely(() => {
      if (clusterName === 'all-clusters') {
        navigate('/clusters');
      } else {
        navigate(`/cluster/${encodeURIComponent(clusterName)}`);
      }
    });
    setShowCompanion((prevState) => ({
      ...prevState,
      show: false,
      fullScreen: false,
    }));
    setIsOpen(false);
  };

  return (
    <div slot="content">
      <Button
        id="clusterSwitcherOpener"
        design="Transparent"
        endIcon="navigation-down-arrow"
        onClick={() => setIsOpen(true)}
      >
        {title}
      </Button>
      {createPortal(
        <Popover
          id="cluster-switcher-popover"
          opener="clusterSwitcherOpener"
          open={isOpen}
          onClose={() => setIsOpen(false)}
          placement="Bottom"
        >
          <List
            onItemClick={(e) => {
              const item = e.detail.item;
              const clusterName =
                item.dataset.cluster || item.getAttribute('data-cluster');
              if (clusterName) {
                handleItemClick(clusterName);
              }
            }}
          >
            <ListItemStandard
              data-cluster="all-clusters"
              accessibleName={t('clusters.overview.title-all-clusters')}
            >
              {t('clusters.overview.title-all-clusters')}
            </ListItemStandard>
            {inactiveClusterNames.map((name) => (
              <ListItemStandard
                key={name}
                data-cluster={name}
                accessibleName={name}
              >
                {name}
              </ListItemStandard>
            ))}
          </List>
        </Popover>,
        document.body,
      )}
    </div>
  );
}
