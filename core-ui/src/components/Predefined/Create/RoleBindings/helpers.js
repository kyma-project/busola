export function validateSubject(subject) {
  // if (!server?.tls) return true;

  // const { mode, credentialName, privateKey, serverCertificate } = server.tls;

  // const hasSecret = !!credentialName;
  // const hasKeyAndCertificate = !!privateKey && !!serverCertificate;

  // const isSimpleOrMutual = mode === 'SIMPLE' || mode === 'MUTUAL';
  // return !isSimpleOrMutual || hasSecret || hasKeyAndCertificate;
  return true;
}

export function validateBinding(binding) {
  const hasSubjects = binding?.subjects?.length;
  const hasRoleRef = binding?.roleRef?.kind || binding?.roleRef?.name;
  const subjectsValid = binding?.subjects?.every(validateSubject);

  return hasSubjects && hasRoleRef && subjectsValid;
}
