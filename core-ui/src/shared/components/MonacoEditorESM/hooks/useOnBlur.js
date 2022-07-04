import { useEffect } from 'react';

export const useOnBlur = ({ editorInstance, onBlur, setHasFocus }) => {
  useEffect(() => {
    //blur listener
    if (!editorInstance) return;
    const blurListener = editorInstance.onDidBlurEditorText(() => {
      setHasFocus(false);
      if (typeof onBlur === 'function') {
        onBlur();
      }
    });
    return () => {
      blurListener.dispose();
    };
  }, [editorInstance, onBlur, setHasFocus]);
};
