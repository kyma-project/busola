import React, { useState } from 'react';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { ComboboxInput } from 'shared/ResourceForm/inputs';
import { useTranslation } from 'react-i18next';

export function ChartContent({ chart }) {
  const { t } = useTranslation();

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
        onSelectionChange={(_, selected) => {
          if (selected.key !== -1) {
            setCurrentFile(selected);
          }
        }}
      />
    </div>
  );

  return (
    <ReadonlyEditorPanel
      title={t('helm-releases.chart-files')}
      value={atob(currentFile?.data || '')}
      actions={actions}
    />
  );
}
