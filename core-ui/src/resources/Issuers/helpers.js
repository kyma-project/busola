import * as jp from 'jsonpath';

export function validateIssuer(issuer, issuerType) {
  const isRequestSet = jp.value(issuer, '$.spec.requestsPerDayQuota') >= 0;
  if (issuerType === 'ca') {
    const isSecretRefSet =
      jp.value(issuer, '$.spec.ca.privateKeySecretRef.name') &&
      jp.value(issuer, '$.spec.ca.privateKeySecretRef.namespace');

    return isRequestSet && isSecretRefSet;
  }
  if (issuerType === 'acme') {
    const isServerSet = jp.value(issuer, '$.spec.acme.server');
    const isEmailSet = jp.value(issuer, '$.spec.acme.email');
    const isAutoRegistrationSet = jp.value(
      issuer,
      '$.spec.acme.autoRegistration',
    );
    const isSecretRefSet = isAutoRegistrationSet
      ? isAutoRegistrationSet
      : jp.value(issuer, '$.spec.acme.privateKeySecretRef.name') &&
        jp.value(issuer, '$.spec.acme.privateKeySecretRef.namespace');
    const isExternalAccountBindingValid =
      (jp.value(issuer, '$.spec.acme.externalAccountBinding.keyID') &&
        jp.value(
          issuer,
          '$.spec.acme.externalAccountBinding.keySecretRef.name',
        ) &&
        jp.value(
          issuer,
          '$.spec.acme.externalAccountBinding.keySecretRef.namespace',
        )) ||
      !jp.value(issuer, '$.spec.acme.externalAccountBinding');
    return (
      isRequestSet &&
      isServerSet &&
      isEmailSet &&
      isSecretRefSet &&
      isExternalAccountBindingValid
    );
  }
  return false;
}
