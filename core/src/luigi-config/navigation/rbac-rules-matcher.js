const isNonEmptyArray = array => {
  return (
    array !== null &&
    typeof array !== 'undefined' &&
    array.length !== null &&
    array.length > 0
  );
};

const arrayContainsStringOrJoker = (array, stringToFind, jokerString) => {
  if (!isNonEmptyArray(array)) {
    return false;
  }
  for (let i = 0, len = array.length; i < len; i++) {
    if (array[i] === stringToFind || array[i] === jokerString) {
      return true;
    }
  }
  return false;
};

const matchingVerbRuleFound = (allrules, requiredVerbRule) => {
  if (!isNonEmptyArray(allrules)) {
    return false;
  }
  for (let i = 0, len = allrules.length; i < len; i++) {
    let rule = allrules[i];
    if (
      arrayContainsStringOrJoker(
        rule.apiGroups,
        requiredVerbRule.apiGroup,
        '*',
      ) &&
      arrayContainsStringOrJoker(
        rule.resources,
        requiredVerbRule.resource,
        '*',
      ) &&
      arrayContainsStringOrJoker(rule.verbs, requiredVerbRule.verbs[0], '*')
    ) {
      return true;
    }
  }
  return false;
};
