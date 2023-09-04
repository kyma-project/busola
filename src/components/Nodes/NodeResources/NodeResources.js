import React from 'react';
import { useTranslation } from 'react-i18next';
import { CircleProgress } from 'shared/components/CircleProgress/CircleProgress';

import './NodeResources.scss';
import { Panel } from '@ui5/webcomponents-react';

export function NodeResources({ metrics, headerContent }) {
  const { t } = useTranslation();
  const { cpu, memory } = metrics || {};
  return (
    <Panel fixed className="node-resources" header={<>{headerContent}</>}>
      {cpu && memory ? (
        <>
          <CircleProgress
            color="var(--sapIndicationColor_7)"
            value={cpu.usage}
            max={cpu.capacity}
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
            max={memory.capacity}
            title={t('machine-info.memory-gib')}
            reversed={true}
            tooltip={{
              content: `${t('machine-info.memory-usage')} ${memory.percentage}`,
              position: 'right',
            }}
          />
        </>
      ) : (
        t('components.error-panel.error')
      )}
    </Panel>
  );
}
