import React from 'react';
import { LayoutPanel } from 'fundamental-react';
import './MachineInfo.scss';

export function MachineInfo({ nodeInfo, capacity }) {
  const formattedMemory =
    Math.round((parseInt(capacity.memory) / 1024 / 1024) * 10) / 10;

  return (
    <LayoutPanel>
      <LayoutPanel.Header>
        <LayoutPanel.Head title="Machine info" />
      </LayoutPanel.Header>
      <LayoutPanel.Body className="machine-info__body">
        <dl>
          <dd>Operating system</dd>
          <dt>{`${nodeInfo.operatingSystem} (${nodeInfo.osImage})`}</dt>
        </dl>
        <dl>
          <dd>Architecture & CPUs</dd>
          <dt>
            {nodeInfo.architecture}, {capacity.cpu} CPUs
          </dt>
        </dl>
        <dl>
          <dd>Pods capacity</dd>
          <dt>{capacity.pods}</dt>
        </dl>
        <dl>
          <dd>Memory</dd>
          <dt>{formattedMemory} GiB</dt>
        </dl>
        <dl>
          <dd>Kube proxy version</dd>
          <dt>{nodeInfo.kubeProxyVersion}</dt>
        </dl>
        <dl>
          <dd>Kubelet version</dd>
          <dt>{nodeInfo.kubeletVersion}</dt>
        </dl>
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
