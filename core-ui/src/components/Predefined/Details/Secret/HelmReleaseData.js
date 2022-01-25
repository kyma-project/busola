import React, { useState } from 'react';
import { decodeHelmRelease } from './decodeHelmRelease';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { ReleaseData } from './ReleaseData';
import { ComboboxInput } from 'shared/ResourceForm/inputs';

function ChartContent({ chart }) {
  const files = [...(chart?.files || []), ...(chart?.templates || [])];

  const options = files.map(({ name, data }) => ({
    text: name,
    key: name,
    data,
  }));

  const [currentFile, setCurrentFile] = useState(options[0]);

  const actions = (
    <div style={{ width: '300px' }}>
      <ComboboxInput
        value={currentFile?.key}
        options={options}
        onSelectionChange={(_, selected) => setCurrentFile(selected)}
      />
    </div>
  );

  return (
    <ReadonlyEditorPanel
      title="Chart Files"
      value={atob(currentFile?.data || '')}
      actions={actions}
    />
  );
}

export function HelmReleaseData(secret) {
  if (secret.type !== 'helm.sh/release.v1') {
    return null;
  }
  const release = decodeHelmRelease(secret.data.release);
  if (!release) {
    return null;
  }

  return (
    <React.Fragment key="helm-release-data">
      <ReleaseData release={release} />
      <ReadonlyEditorPanel
        title="Release config"
        value={JSON.stringify(release.config, null, 2)}
      />
      <ChartContent chart={release.chart} />
    </React.Fragment>
  );
}
