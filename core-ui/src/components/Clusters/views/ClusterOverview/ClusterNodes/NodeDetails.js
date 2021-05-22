import React from 'react';
import { Tooltip, CircleProgress } from 'react-shared';
import { LayoutPanel } from 'fundamental-react';

export function NodeDetails({ name, cpu, memory }) {
  return (
    <LayoutPanel>
      <LayoutPanel.Header>
        <LayoutPanel.Head title={name} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <Tooltip content={`CPU usage: ${cpu.percentage}`} position="right">
          <CircleProgress
            color="var(--sapIndicationColor_7)"
            value={cpu.usage}
            max={cpu.allocatable}
            title="CPU (m)"
            reversed={true}
          />
        </Tooltip>
        <Tooltip
          content={`Memory usage: ${memory.percentage}`}
          position="right"
        >
          <CircleProgress
            color="var(--sapIndicationColor_6)"
            value={memory.usage}
            max={memory.allocatable}
            title="Memory (GiB)"
            reversed={true}
          />
        </Tooltip>
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
