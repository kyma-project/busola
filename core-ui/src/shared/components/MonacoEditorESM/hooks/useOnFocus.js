import { useEffect } from 'react';

export const useOnFocus = ({ editorInstance, onFocus }) => {
  useEffect(() => {
    if (!editorInstance) return;
    const focusListener = editorInstance.onDidFocusEditorText(() => {
      if (typeof onFocus === 'function') {
        onFocus();
      }
    });

    return () => {
      focusListener.dispose();
    };
  }, [editorInstance, onFocus]);
};
