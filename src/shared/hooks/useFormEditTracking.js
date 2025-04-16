import { cloneDeep, isEqual } from 'lodash';
import { useEffect, useMemo, useRef } from 'react';
import { useSetRecoilState } from 'recoil';
import { isResourceEditedState } from 'state/resourceEditedAtom';

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
  editorError = false,
) {
  const setIsResourceEdited = useSetRecoilState(isResourceEditedState);
  // timeout ID for debouncing
  const timeoutRef = useRef(null);

  const excludedResource = useMemo(() => {
    console.log(excludeStatus(resource));
    return excludeStatus(resource);
  }, [resource]);

  const excludedInitialResource = useMemo(() => {
    console.log(excludeStatus(initialResource));
    return excludeStatus(initialResource);
  }, [initialResource]);

  const isEdited = useMemo(() => {
    if (!excludedResource || !excludedInitialResource) return false;
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
