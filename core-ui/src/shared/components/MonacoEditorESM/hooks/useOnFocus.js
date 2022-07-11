import { useEffect } from 'react';

export const useOnFocus = ({
  editorInstance,
  onFocus,
  setAutocompleteOptions,
  activeSchemaPath,
  setHasFocus,
  descriptor,
}) => {
  useEffect(() => {
    if (!editorInstance || !onFocus) return;
    const focusListener = editorInstance.onDidFocusEditorText(() => {
      setHasFocus(true);
      if (typeof onFocus === 'function') {
        onFocus();
      }

      // refresh model on editor focus. Needed for cases when multiple editors are open simultaneously
      if (activeSchemaPath !== descriptor.current?.path) {
        setAutocompleteOptions();
      }
    });

    return () => {
      focusListener.dispose();
    };
  }, [
    descriptor,
    editorInstance,
    onFocus,
    setAutocompleteOptions,
    activeSchemaPath,
    setHasFocus,
  ]);
};
