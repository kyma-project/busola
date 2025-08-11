import { useSetAtom } from 'jotai';
import { cloneDeep, isEqual } from 'lodash';
import { useEffect, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { isFormOpenState } from 'state/formOpenAtom';
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
  const { formOpen } = useRecoilValue(isFormOpenState);
  const setIsResourceEdited = useSetAtom(isResourceEditedState);

  const excludedResource = useMemo(() => excludeStatus(resource), [resource]);

  const excludedInitialResource = useMemo(
    () => excludeStatus(initialResource),
    [initialResource],
  );

  const isEdited = useMemo(() => {
    return !isEqual(excludedResource, excludedInitialResource) || editorError;
  }, [excludedResource, excludedInitialResource, editorError]);

  useEffect(() => {
    if (formOpen && isEdited) {
      setIsResourceEdited(prevState => ({ ...prevState, isEdited: true }));
    } else {
      setIsResourceEdited({ isEdited: false });
    }
  }, [formOpen, isEdited, setIsResourceEdited]);
}
