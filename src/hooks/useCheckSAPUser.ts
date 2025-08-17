import { useAtomValue } from 'jotai';
import { jwtDecode } from 'jwt-decode';
import { AuthDataState, authDataState } from 'state/authDataAtom';

export function useCheckSAPUser() {
  const authData: AuthDataState = useAtomValue(authDataState);
  if (window.location.host.includes('localhost')) {
    return true;
  }
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
}
