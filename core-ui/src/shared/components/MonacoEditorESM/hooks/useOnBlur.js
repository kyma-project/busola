import { useEffect } from 'react';

export const useOnBlur = ({ editorInstance, onBlur }) => {
  useEffect(() => {
    if (!editorInstance) return;
    const blurListener = editorInstance.onDidBlurEditorText(() => {
      if (typeof onBlur === 'function') {
        onBlur();
      }
    });
    return () => {
      blurListener.dispose();
    };
  }, [editorInstance, onBlur]);
};
