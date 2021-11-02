export function validateSecret(secret) {
  return !!secret.name && !!secret.namespace;
}

export function validateServiceAccount(serviceAccount) {
  const hasServiceAccounts = serviceAccount?.secrets?.length;
  const serviceAccountsValid = serviceAccount?.secrets?.every(validateSecret);

  return !hasServiceAccounts || (hasServiceAccounts && serviceAccountsValid);
}
