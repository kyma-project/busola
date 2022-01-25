import React from 'react';
import { LayoutPanel } from 'fundamental-react';
import { ReadableCreationTimestamp } from 'react-shared';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { ReleaseStatus } from './ReleaseStatus';

export function ReleaseData({ release }) {
  const { name, version, chart, info } = release;
  return (
    <LayoutPanel className="fd-margin--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={'Release ' + name + ' v' + version} />
        <div className="fd-margin-begin--sm">
          <ReleaseStatus release={release} />
        </div>
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <LayoutPanelRow name=" Chart Version" value={chart.metadata.version} />
        <LayoutPanelRow name="Chart Name" value={chart.metadata.name} />
        <LayoutPanelRow
          name="Chart Description"
          value={chart.metadata.description}
        />
        <LayoutPanelRow
          name="First Deployed"
          value={<ReadableCreationTimestamp timestamp={info.first_deployed} />}
        />
        <LayoutPanelRow
          name="Last Deployed"
          value={<ReadableCreationTimestamp timestamp={info.last_deployed} />}
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
