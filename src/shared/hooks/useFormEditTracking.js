import { cloneDeep, isEqual } from 'lodash';
import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useSetRecoilState } from 'recoil';
import { getIsFormOpenState } from 'state/formOpenSlice';
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
  const { formOpen } = useSelector(getIsFormOpenState);
  const setIsResourceEdited = useSetRecoilState(isResourceEditedState);

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
