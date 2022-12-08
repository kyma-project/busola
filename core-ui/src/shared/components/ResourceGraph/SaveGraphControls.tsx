import { saveAs } from 'file-saver';
import { Button, Icon } from 'fundamental-react';
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
      onClick={() => {
        const blob = new Blob([content], {
          type: 'text/vnd.graphviz',
        });
        saveAs(blob, name);
      }}
    >
      <Icon
        ariaLabel="download"
        glyph="download"
        className="fd-margin-end--tiny"
      />
      {t('resource-graph.save-as-dot')}
    </Button>
  );
}
