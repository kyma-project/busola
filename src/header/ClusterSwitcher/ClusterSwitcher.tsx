import { useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  Button,
  ButtonDomRef,
  Menu,
  MenuDomRef,
  MenuItem,
} from '@ui5/webcomponents-react';

import { clustersAtom } from 'state/clustersAtom';
import { clusterAtom } from 'state/clusterAtom';
import { showKymaCompanionAtom } from 'state/companion/showKymaCompanionAtom';
import { useFormNavigation } from 'shared/hooks/useFormNavigation';

export function ClusterSwitcher() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { navigateSafely } = useFormNavigation();

  const cluster = useAtomValue(clusterAtom);
  const clusters = useAtomValue(clustersAtom);
  const setShowCompanion = useSetAtom(showKymaCompanionAtom);

  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<ButtonDomRef>(null);
  const menuRef = useRef<MenuDomRef>(null);

  const isOnClustersPage = location.pathname === '/clusters';

  const inactiveClusterNames = useMemo(
    () => Object.keys(clusters || {}).filter((name) => name !== cluster?.name),
    [clusters, cluster],
  );

  const title = useMemo(
    () => (!isOnClustersPage ? cluster?.contextName || cluster?.name : ''),
    [isOnClustersPage, cluster],
  );

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
        ref={buttonRef}
        id="clusterSwitcherOpener"
        design="Transparent"
        endIcon="navigation-down-arrow"
        onClick={() => {
          // Menu renders its popover in shadow DOM and exposes no sizing API,
          // so reach in and set minWidth to the opener's width before opening.
          const popover =
            menuRef.current?.shadowRoot?.querySelector<HTMLElement>(
              'ui5-responsive-popover',
            );
          if (popover && buttonRef.current) {
            popover.style.minWidth = `${buttonRef.current.offsetWidth}px`;
          }
          setIsOpen(true);
        }}
      >
        {title}
      </Button>
      <Menu
        ref={menuRef}
        opener="clusterSwitcherOpener"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onItemClick={(e) => {
          const clusterName = e.detail.item.dataset.cluster;
          if (clusterName) {
            handleItemClick(clusterName);
          }
        }}
      >
        <MenuItem
          data-cluster="all-clusters"
          text={t('clusters.overview.title-all-clusters')}
        />
        {inactiveClusterNames.map((name) => (
          <MenuItem key={name} data-cluster={name} text={name} />
        ))}
      </Menu>
    </div>
  );
}
