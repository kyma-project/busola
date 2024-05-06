import { useRecoilValue } from 'recoil';
import jsonata from 'jsonata';
import { isEqual } from 'lodash';
import { getReadableTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { doesUserHavePermission } from 'state/navigation/filters/permissions';
import { permissionSetsSelector } from 'state/permissionSetsSelector';
import { jwtDecode } from 'jwt-decode';
import { AuthDataState, authDataState } from 'state/authDataAtom';

export function jsonataWrapper(expression: string) {
  const exp = jsonata(expression);

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
      { resourceGroupAndVersion, resourceKind: resourceKind.toLowerCase() },
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
