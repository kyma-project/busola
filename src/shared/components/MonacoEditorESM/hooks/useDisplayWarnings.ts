import { MutableRefObject, useEffect, useState } from 'react';
import { editor, Uri } from 'monaco-editor';

export const useDisplayWarnings = ({
  autocompletionDisabled,
  descriptor,
}: {
  autocompletionDisabled: boolean;
  descriptor: MutableRefObject<Uri>;
}) => {
  const [markers, setMarkers] = useState<editor.IMarker[]>([]);

  useEffect(() => {
    // show warnings in a message strip at the bottom of editor
    if (autocompletionDisabled) {
      return;
    }
    const onDidChangeMarkers = editor.onDidChangeMarkers((markers) => {
      if (markers.length) {
        const descriptiveMarkers = editor.getModelMarkers({
          resource: descriptor.current,
        });
        setMarkers(descriptiveMarkers);
      }
    });

    return () => {
      onDidChangeMarkers.dispose();
    };
  }, [setMarkers, autocompletionDisabled, descriptor]);

  return markers;
};
