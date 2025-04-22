import { cloneDeep, isEqual } from 'lodash';
import { useEffect, useMemo } from 'react';
import { useSetRecoilState } from 'recoil';
import { isResourceEditedState } from 'state/resourceEditedAtom';

const excludeStatus = resource => {
  if (!resource) return null;
  const modifiedResource = cloneDeep(resource);
  delete modifiedResource.status;
  delete modifiedResource.metadata?.resourceVersion;
  delete modifiedResource.metadata?.managedFields;
  delete modifiedResource.metadata?.generation;
  return modifiedResource;
};

export function useFormEditTracking(
  resource,
  initialResource,
  editorError = false,
) {
  const setIsResourceEdited = useSetRecoilState(isResourceEditedState);

  const excludedResource = useMemo(() => excludeStatus(resource), [resource]);

  const excludedInitialResource = useMemo(
    () => excludeStatus(initialResource),
    [initialResource],
  );

  const isEdited = useMemo(() => {
    if (!excludedResource || !excludedInitialResource) return false;
    return !isEqual(excludedResource, excludedInitialResource) || editorError;
  }, [excludedResource, excludedInitialResource, editorError]);

  useEffect(() => {
    if (isEdited) {
      setIsResourceEdited(prevState => ({ ...prevState, isEdited: true }));
    } else {
      setIsResourceEdited({ isEdited: false });
    }
  }, [isEdited, setIsResourceEdited]);
}
