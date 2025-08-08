import { Dispatch, RefObject, SetStateAction } from 'react';

export const checkAuthRequiredInputs = (
  authFormRef: RefObject<HTMLFormElement>,
  setHasInvalidInputs: Dispatch<SetStateAction<boolean>>,
) => {
  const invalidList = authFormRef?.current?.querySelectorAll(':invalid');
  const scopes = authFormRef?.current?.querySelector(
    '[accessible-name="Scopes"]',
  );
  const scopesValid = [
    ...(scopes?.querySelectorAll('ui5-input') ?? []),
  ]?.filter((el: any) => el?.value);
  const isScopesInvalid = scopes && !scopesValid?.length;
  if (invalidList?.length || isScopesInvalid) {
    setHasInvalidInputs(true);
  } else {
    setHasInvalidInputs(false);
  }
};
