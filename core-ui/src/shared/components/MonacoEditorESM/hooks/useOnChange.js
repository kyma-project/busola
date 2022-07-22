import { useEffect } from 'react';

export const useOnChange = ({ editorInstance, onChange }) => {
  useEffect(() => {
    if (!editorInstance || typeof onChange !== 'function') return;
    // update parent component state on value change
    const changeListener = editorInstance.onDidChangeModelContent(() => {
      const editorValue = editorInstance.getValue();
      onChange?.(editorValue);
    });
    return () => {
      changeListener.dispose();
    };
  }, [editorInstance, onChange]);
};
