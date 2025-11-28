// import { jwtDecode } from 'jwt-decode';
// import { useAtomValue } from 'jotai';
// import { AuthDataState, authDataAtom } from 'state/authDataAtom';

export function useCheckSAPUser() {
  // const authData: AuthDataState = useAtomValue(authDataAtom);
  // if (window.location.host.includes('localhost')) {
  //   return true;
  // }
  // try {
  //   if (authData && 'token' in authData) {
  //     const decoded = jwtDecode(authData?.token);
  //     return decoded?.sub?.includes('@sap.com');
  //   }
  // } catch (error) {
  //   console.error('Error while checking if user is SAP user', error);
  //   return false;
  // }
  return true;
}
