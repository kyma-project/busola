import React from 'react';
import { CircleProgress } from 'react-shared';
import { LayoutPanel } from 'fundamental-react';
import './NodeResources.scss';

export function NodeResources({ metrics, headerContent }) {
  const { cpu, memory } = metrics;

  return (
    <LayoutPanel className="node-resources">
      <LayoutPanel.Header>{headerContent}</LayoutPanel.Header>
      <LayoutPanel.Body>
        <CircleProgress
          color="var(--sapIndicationColor_7)"
          value={cpu.usage}
          max={cpu.allocatable}
          title="CPU (m)"
          reversed={true}
          tooltip={{
            content: `CPU usage: ${cpu.percentage}`,
            position: 'right',
          }}
        />
        <CircleProgress
          color="var(--sapIndicationColor_6)"
          value={memory.usage}
          max={memory.allocatable}
          title="Memory (GiB)"
          reversed={true}
          tooltip={{
            content: `Memory usage: ${memory.percentage}`,
            position: 'right',
          }}
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
