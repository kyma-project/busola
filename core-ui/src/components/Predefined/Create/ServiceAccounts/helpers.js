export function validateSecret(secret) {
  return !!secret.name && !!secret.namespace;
}

export function validateServiceAccount(serviceAccount) {
  const hasSubjects = serviceAccount?.secrets?.length;
  const subjectsValid = serviceAccount?.secrets?.every(validateSecret);

  return hasSubjects && subjectsValid;
}
