export function sortByDisplayName(planA, planB) {
  return planA.spec.externalMetadata?.displayName >
    planB.spec.externalMetadata?.displayName
    ? 1
    : -1;
}
