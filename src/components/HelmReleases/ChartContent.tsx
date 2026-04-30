import { useState } from 'react';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { ComboboxInput } from 'shared/ResourceForm/inputs';
import { useTranslation } from 'react-i18next';

type Option = {
  text: string;
  key: string;
  data?: any;
};

export function ChartContent({
  chart,
}: {
  chart?: {
    files?: { name?: string; data?: any }[];
    templates?: { name?: string; data?: any }[];
  };
}) {
  const { t } = useTranslation();

  const files = [...(chart?.files || []), ...(chart?.templates || [])];

  const options: Option[] = files
    .filter(({ name }) => name !== undefined)
    .map(({ name, data }) => ({
      text: name as string,
      key: name as string,
      data,
    }));

  const [currentFile, setCurrentFile] = useState<Option>(options[0]);

  const actions = (
    <div style={{ width: '300px' }}>
      <ComboboxInput
        value={currentFile?.key}
        options={options}
        onSelectionChange={(_, selected) => {
          if (selected.key !== '') {
            setCurrentFile(selected as Option);
          }
        }}
      />
    </div>
  );

  return (
    <ReadonlyEditorPanel
      title={t('helm-releases.headers.chart-files')}
      value={atob(currentFile?.data || '')}
      actions={actions}
    />
  );
}
