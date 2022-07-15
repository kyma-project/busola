import { useEffect } from 'react';

export const useOnFocus = ({ editorInstance, onFocus }) => {
  useEffect(() => {
    if (!editorInstance || typeof onFocus !== 'function') return;

    const focusListener = editorInstance.onDidFocusEditorText(() => {
      onFocus();
    });

    return () => {
      focusListener.dispose();
    };
  }, [editorInstance, onFocus]);
};
