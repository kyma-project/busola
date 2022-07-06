import { useEffect } from 'react';

export const useUpdateValueOnParentChange = ({
  editorInstance,
  value,
  hasFocus,
  error,
}) => {
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
};
