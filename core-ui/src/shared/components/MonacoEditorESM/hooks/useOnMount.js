import { useEffect } from 'react';

export const useOnMount = ({ editorInstance, onMount }) => {
  useEffect(() => {
    // pass editor instance to parent
    if (!editorInstance) return;
    if (typeof onMount === 'function') {
      onMount(editorInstance);
    }
  }, [editorInstance, onMount]);
};
