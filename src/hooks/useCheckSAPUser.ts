import { jwtDecode } from 'jwt-decode';
import { useRecoilValue } from 'recoil';
import { AuthDataState, authDataState } from 'state/authDataAtom';

export function useCheckSAPUser() {
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
}
