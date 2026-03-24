export function validateSubject(subject: any) {
  const hasGroup =
    subject.kind === 'Group' && !!subject.name && !!subject.apiGroup;
  const hasUser =
    subject.kind === 'User' && !!subject.name && !!subject.apiGroup;
  const hasAccount =
    subject.kind === 'ServiceAccount' && !!subject.name && !!subject.namespace;
  return hasGroup || hasUser || hasAccount;
}

export function validateBinding(binding: any) {
  const hasSubjects = binding?.subjects?.length;
  const hasRoleRef = binding?.roleRef?.kind || binding?.roleRef?.name;
  const subjectsValid = binding?.subjects?.every(validateSubject);

  return hasSubjects && hasRoleRef && subjectsValid;
}
