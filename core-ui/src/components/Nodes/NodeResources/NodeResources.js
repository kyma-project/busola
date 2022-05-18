import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutPanel } from 'fundamental-react';

import { ProgressBar } from 'shared/components/ProgressBar/ProgressBar';

import './NodeResources.scss';

export function NodeResources({ metrics, headerContent }) {
  const { t } = useTranslation();
  const { cpu, memory } = metrics || {};
  return (
    <LayoutPanel className="node-resources">
      <LayoutPanel.Header>{headerContent}</LayoutPanel.Header>
      <LayoutPanel.Body>
        {cpu && memory ? (
          <>
            CPU:
            <ProgressBar
              current={cpu.usage}
              max={cpu.capacity}
              percentage={cpu.percentage}
              tooltip={{
                content: `${t('machine-info.cpu-usage')} ${cpu.percentage}`,
                position: 'right',
              }}
            />
            Memory:
            <ProgressBar
              current={memory.usage}
              max={memory.capacity}
              percentage={memory.percentage}
              tooltip={{
                content: `${t('machine-info.memory-usage')} ${
                  memory.percentage
                }`,
                position: 'right',
              }}
            />
          </>
        ) : (
          t('components.error-panel.error')
        )}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
