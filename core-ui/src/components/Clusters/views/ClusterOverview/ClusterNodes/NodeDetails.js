import React from 'react';
import { CircleProgress } from 'react-shared';
import { LayoutPanel } from 'fundamental-react';

export function NodeDetails({ name, cpu, memory }) {
  return (
    <LayoutPanel>
      <LayoutPanel.Header>
        <LayoutPanel.Head title={name} />
      </LayoutPanel.Header>
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
