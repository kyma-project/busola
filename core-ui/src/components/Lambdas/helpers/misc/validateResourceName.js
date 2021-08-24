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
    return t('functions.create-view.errors.required-name');
  }

  if (name.length > 63) {
    return t('functions.create-view.errors.too-long');
  }

  const regex = /^[a-z]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
  if (!regex.test(name)) {
    return t('common.tooltips.k8s-name-input');
  }

  return '';
}
