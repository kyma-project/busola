import { useState } from 'react';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { ComboboxInput } from 'shared/ResourceForm/inputs';
import { useTranslation } from 'react-i18next';

type Option = {
  text?: string;
  key?: string | number;
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

  const options = files.map(({ name, data }) => ({
    text: name,
    key: name,
    data,
  }));

  const [currentFile, setCurrentFile] = useState<Option>(options[0]);

  const actions = (
    <div style={{ width: '300px' }}>
      {/*@ts-expect-error Type mismatch between js and ts*/}
      <ComboboxInput
        value={currentFile?.key}
        options={options}
        onSelectionChange={(_: Event, selected: Option) => {
          if (selected.key !== -1) {
            setCurrentFile(selected);
          }
        }}
      />
    </div>
  );

  return (
    /*@ts-expect-error Type mismatch between js and ts*/
    <ReadonlyEditorPanel
      title={t('helm-releases.headers.chart-files')}
      value={atob(currentFile?.data || '')}
      actions={actions}
    />
  );
}
