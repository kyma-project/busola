import { LAMBDAS_LIST } from 'components/Lambdas/constants';

export function validateResourceName(
  name = '',
  errorMessages = LAMBDAS_LIST.CREATE_MODAL.INPUTS.NAME.ERRORS,
  t,
) {
  if (!errorMessages) {
    return '';
  }

  if (!name) {
    return t(errorMessages.EMPTY);
  }

  if (name.length > 63) {
    return t(errorMessages.TOO_LONG);
  }

  const regex = /^[a-z]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
  if (!regex.test(name)) {
    return t(errorMessages.INVALID);
  }

  return '';
}
