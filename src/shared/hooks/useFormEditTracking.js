import { cloneDeep, isEqual } from 'lodash';
import { useEffect, useMemo, useRef } from 'react';

const excludeStatus = resource => {
  if (!resource) return null;
  const modifiedResource = cloneDeep(resource);
  delete modifiedResource.status;
  delete modifiedResource.metadata?.resourceVersion;
  delete modifiedResource.metadata?.managedFields;
  return modifiedResource;
};

export function useFormEditTracking(
  resource,
  initialResource,
  setIsResourceEdited,
  editorError = false,
) {
  // timeout ID for debouncing
  const timeoutRef = useRef(null);

  const excludedResource = useMemo(() => excludeStatus(resource), [resource]);
  const excludedInitialResource = useMemo(
    () => excludeStatus(initialResource),
    [initialResource],
  );

  const isEdited = useMemo(() => {
    return !isEqual(excludedResource, excludedInitialResource) || editorError;
  }, [excludedResource, excludedInitialResource, editorError]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // delay the state update
    timeoutRef.current = setTimeout(() => {
      if (isEdited) {
        setIsResourceEdited(prevState => ({ ...prevState, isEdited: true }));
      } else {
        setIsResourceEdited({ isEdited: false });
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isEdited, setIsResourceEdited]);
}
