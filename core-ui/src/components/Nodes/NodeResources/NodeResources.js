import React from 'react';
import { useTranslation } from 'react-i18next';
import { CircleProgress } from 'react-shared';
import { LayoutPanel } from 'fundamental-react';

import './NodeResources.scss';

export function NodeResources({ metrics, headerContent }) {
  const { cpu, memory } = metrics;
  const { t } = useTranslation();
  return (
    <LayoutPanel className="node-resources">
      <LayoutPanel.Header>{headerContent}</LayoutPanel.Header>
      <LayoutPanel.Body>
        <CircleProgress
          color="var(--sapIndicationColor_7)"
          value={cpu.usage}
          max={cpu.allocatable}
          title={t('machine-info.cpu-m')}
          reversed={true}
          tooltip={{
            content: `${t('machine-info.cpu-usage')} ${cpu.percentage}`,
            position: 'right',
          }}
        />
        <CircleProgress
          color="var(--sapIndicationColor_6)"
          value={memory.usage}
          max={memory.allocatable}
          title={t('machine-info.memory-gib')}
          reversed={true}
          tooltip={{
            content: `${t('machine-info.memory-usage')} ${memory.percentage}`,
            position: 'right',
          }}
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
