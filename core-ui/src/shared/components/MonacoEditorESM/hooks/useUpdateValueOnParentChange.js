import { useEffect, useState } from 'react';

export const useUpdateValueOnParentChange = ({
  editorInstance,
  value,
  error,
}) => {
  const [hasFocus, setHasFocus] = useState(false);

  useEffect(() => {
    // update editor value when it comes as a prop
    if (
      !error &&
      !hasFocus &&
      editorInstance &&
      editorInstance.getValue() !== value
    ) {
      editorInstance.setValue(value);
    }
  }, [editorInstance, value, hasFocus, error]);

  useEffect(() => {
    //disable the updates when editor has focus
    if (!editorInstance) return;

    const setEditorHasFocus = editorInstance.onDidFocusEditorText(() => {
      setHasFocus(true);
    });
    const setEditorLostFocus = editorInstance.onDidBlurEditorText(() => {
      setHasFocus(false);
    });

    return () => {
      setEditorHasFocus.dispose();
      setEditorLostFocus.dispose();
    };
  }, [editorInstance, setHasFocus]);
};
