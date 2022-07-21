import { useEffect } from 'react';

export const useOnBlur = ({ editorInstance, onBlur }) => {
  useEffect(() => {
    if (!editorInstance || typeof onBlur !== 'function') return;

    const blurListener = editorInstance.onDidBlurEditorText(() => {
      onBlur();
    });
    return () => {
      blurListener.dispose();
    };
  }, [editorInstance, onBlur]);
};
