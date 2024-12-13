import { useRecoilValue } from 'recoil';
import jsonata from 'jsonata';
import { isEqual } from 'lodash';
import { getReadableTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { doesUserHavePermission } from 'state/navigation/filters/permissions';
import { permissionSetsSelector } from 'state/permissionSetsSelector';
import { jwtDecode } from 'jwt-decode';
import { AuthDataState, authDataState } from 'state/authDataAtom';

/*
  Turns jsonata expressions like
  "$root.spec.some-specific-path" into "$root.spec.`some-specific-path`"
  see more examples in the corresponding unit test
*/
export const escapeKebabCase = (expr: string) => {
  const stringLiteralPattern = /(["'`])(?:\\.|[^\\])*?\1/g;
  const identifierPattern = /([a-zA-Z_][\w-]*)(-\w+)/g;

  // Placeholder character that is unlikely to be in the input (NULL character)
  const placeholder = '\u0000';

  // First, extract all string literals to preserve them.
  const literals: any = [];
  const expressionWithoutStrings = expr.replace(stringLiteralPattern, match => {
    literals.push(match);
    // Encapsulate index with placeholder
    return placeholder + (literals.length - 1) + placeholder;
  });

  // Escape hyphens in the remaining expression (outside of string literals)
  const escapedExpression = expressionWithoutStrings.replace(
    identifierPattern,
    '`$1$2`',
  );

  // Restore string literals in their original places
  return escapedExpression.replace(
    new RegExp(placeholder + '(\\d+)' + placeholder, 'g'),
    (_, index) => literals[index],
  );
};

export function jsonataWrapper(expression: string) {
  const escapedExpression = escapeKebabCase(expression);
  const exp = jsonata(escapedExpression);

  exp.registerFunction('matchByLabelSelector', (pod, labels) => {
    if (!pod.metadata?.labels || !labels) return false;

    const podLabels = Object?.entries(pod.metadata?.labels);
    const resourceLabels = Object?.entries(labels);
    return resourceLabels.every(resLabel =>
      podLabels.some(podLabel => isEqual(resLabel, podLabel)),
    );
  });

  exp.registerFunction(
    'matchEvents',
    (resource, resourceKind, resourceName) => {
      return (
        resource?.involvedObject?.name === resourceName &&
        resource?.involvedObject?.kind === resourceKind
      );
    },
  );

  exp.registerFunction('compareStrings', (first, second) => {
    return first?.localeCompare(second) ?? 1;
  });

  exp.registerFunction('readableTimestamp', timestamp => {
    return getReadableTimestamp(timestamp);
  });

  exp.registerFunction('canI', (resourceGroupAndVersion, resourceKind) => {
    const permissionSet = useRecoilValue(permissionSetsSelector);

    const isPermitted = doesUserHavePermission(
      ['list'],
      { resourceGroupAndVersion, resourceKind: resourceKind },
      permissionSet,
    );

    return isPermitted;
  });

  exp.registerFunction('prepareUrl', (url, overrides) => {
    const parsedUrl = url.replace(new RegExp('{([^{]+)}', 'g'), function(
      _: any,
      overrideName: string,
    ) {
      return overrides[overrideName];
    });
    return parsedUrl;
  });

  exp.registerFunction('isSAPuser', () => {
    const authData: AuthDataState = useRecoilValue(authDataState);
    try {
      if (authData && 'token' in authData) {
        const decoded = jwtDecode(authData?.token);
        return decoded?.sub?.includes('@sap.com');
      }
    } catch (error) {
      console.error('Error while checking if user is SAP user', error);
      return false;
    }
    return false;
  });

  return exp;
}
