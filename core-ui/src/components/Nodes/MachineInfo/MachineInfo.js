import React from 'react';
import { LayoutPanel } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import './MachineInfo.scss';

export function MachineInfo({ nodeInfo, capacity }) {
  const formattedMemory =
    Math.round((parseInt(capacity.memory) / 1024 / 1024) * 10) / 10;
  const { t } = useTranslation();

  return (
    <LayoutPanel>
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('machine-info.title')} />
      </LayoutPanel.Header>
      <LayoutPanel.Body className="machine-info__body">
        <dl>
          <dd>{t('machine-info.operating-system')}</dd>
          <dt>{`${nodeInfo.operatingSystem} (${nodeInfo.osImage})`}</dt>
        </dl>
        <dl>
          <dd>{t('machine-info.architecture-cpus')}</dd>
          <dt>
            {nodeInfo.architecture}, {capacity.cpu} {t('machine-info.cpus')}
          </dt>
        </dl>
        <dl>
          <dd>{t('machine-info.pods-capacity')}</dd>
          <dt>{capacity.pods}</dt>
        </dl>
        <dl>
          <dd>{t('machine-info.memory')}</dd>
          <dt>
            {formattedMemory} {t('machine-info.gib')}
          </dt>
        </dl>
        <dl>
          <dd>{t('machine-info.kube-proxy-version')}</dd>
          <dt>{nodeInfo.kubeProxyVersion}</dt>
        </dl>
        <dl>
          <dd>{t('machine-info.kubelet-version')}</dd>
          <dt>{nodeInfo.kubeletVersion}</dt>
        </dl>
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
