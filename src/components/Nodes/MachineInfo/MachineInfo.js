import React from 'react';
import { useTranslation } from 'react-i18next';
import { Panel, Title, Toolbar } from '@ui5/webcomponents-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';

import './MachineInfo.scss';

export function MachineInfo({ nodeInfo, capacity }) {
  const formattedMemory =
    Math.round((parseInt(capacity.memory) / 1024 / 1024) * 10) / 10;
  const { t } = useTranslation();

  return (
    <Panel
      fixed
      header={
        <Toolbar>
          <Title level="H5">{t('machine-info.title')}</Title>
        </Toolbar>
      }
    >
      <div className="machine-info__body">
        <LayoutPanelRow
          name={t('machine-info.operating-system')}
          value={`${nodeInfo.operatingSystem} (${nodeInfo.osImage})`}
        />
        <LayoutPanelRow
          name={t('machine-info.architecture-cpus')}
          value={`${nodeInfo.architecture}, ${capacity.cpu} ${t(
            'machine-info.cpus',
          )}`}
        />
        <LayoutPanelRow
          name={t('machine-info.pods-capacity')}
          value={capacity.pods}
        />
        <LayoutPanelRow
          name={t('machine-info.memory')}
          value={`${formattedMemory} ${t('machine-info.gib')}`}
        />
        <LayoutPanelRow
          name={t('machine-info.kube-proxy-version')}
          value={nodeInfo.kubeProxyVersion}
        />
        <LayoutPanelRow
          name={t('machine-info.kubelet-version')}
          value={nodeInfo.kubeletVersion}
        />
      </div>
    </Panel>
  );
}
