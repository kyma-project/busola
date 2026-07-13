import { saveAs } from 'file-saver';
import { Button } from '@ui5/webcomponents-react';

export function SaveGraphControls({
  content,
  name,
}: {
  content: string;
  name: string;
}) {
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
    />
  );
}
