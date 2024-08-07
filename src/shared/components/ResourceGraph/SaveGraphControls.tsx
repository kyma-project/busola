import { saveAs } from 'file-saver';
import { Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

export function SaveGraphControls({
  content,
  name,
}: {
  content: string;
  name: string;
}) {
  const { t } = useTranslation();
  return (
    <Button
      className="controls"
      icon="download"
      onClick={() => {
        const blob = new Blob([content], {
          type: 'text/vnd.graphviz',
        });
        saveAs(blob, name);
      }}
    >
      {t('resource-graph.save-as-dot')}
    </Button>
  );
}
