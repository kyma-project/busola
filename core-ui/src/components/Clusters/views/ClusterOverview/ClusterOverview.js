import React, { useEffect } from 'react';
import { ClusterOverviewHeader } from './ClusterOverviewHeader';
import { ClusterNodes } from './ClusterNodes/ClusterNodes';
import './ClusterOverview.scss';
import { useClusters } from 'store/clusters/useClusters';
import { useAuth } from 'store/clusters/useAuth';
import jwtDecode from 'jwt-decode';

export function ClusterOverview() {
  // const auth = useAuth();
  // async function doFetch() {
  //   try {
  //     const t = await fetch('http://localhost:3001/api/v1', {
  //       headers: {
  //         accept: '*/*',
  //         'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8,pl;q=0.7',
  //         'x-cluster-certificate-authority-data':
  //           'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUM5akNDQWQ2Z0F3SUJBZ0lRUHlXZmVWcE5xUFRidXRId0o5a2hmekFOQmdrcWhraUc5dzBCQVFzRkFEQVYKTVJNd0VRWURWUVFERXdwcmRXSmxjbTVsZEdWek1CNFhEVEl5TURReU1qQTJOVEl4T0ZvWERUTXlNRFF5TWpBMgpOVEl4T0Zvd0ZURVRNQkVHQTFVRUF4TUthM1ZpWlhKdVpYUmxjekNDQVNJd0RRWUpLb1pJaHZjTkFRRUJCUUFECmdnRVBBRENDQVFvQ2dnRUJBS1ZHR3E0WXQ3bnE4TGpnOEZsK01nTDlwYktHSG04SDIyYmlobG9RVUp0SDBsbmQKU2pjLzljM2gyQUU2cmVtUzBWUXA5SlhvOFRHTFpLa0JEZ0UwaHFMVVFDYzZYc0paTjIyQktqQlEwR0dxb0duNgptTkFaMEVDZUZiSTgyM2lDdXVsNEIyVXlBYjMxcGJtSmdVWHl2RUp4SEFrMEF6TUVnWVhjZ3Zid0pPRmVIV2xuCmRQS0U4Q3Q1cnNJRkJuUDE2ZnRpWDZ5UFhLN04xUkhOUWVSa0RZYzZiVjdXeGdvUGlBVFBsRFI0b002bTZENDgKZXpGSWFvQjZmLzhvUHNyV1dHWFZwU0ZjaXFKUUZWNGI1RUZ5RmNuOGpjaXRJNjZkVy9qdkNsVjllaUR1eVArSApXRTdUemNwdkM4WFZ2RUIwOFFTeGlkMk91UVJtV0RQQnYxcHZDV2tDQXdFQUFhTkNNRUF3RGdZRFZSMFBBUUgvCkJBUURBZ0dtTUE4R0ExVWRFd0VCL3dRRk1BTUJBZjh3SFFZRFZSME9CQllFRlBZNUk3U0ZmR3dHSUs2MC9NQnkKSUJJUTJnU09NQTBHQ1NxR1NJYjNEUUVCQ3dVQUE0SUJBUUNJTE5TNkZKOHhEMnE4UGZYWHVPMzN4R1hGQ21XLwpnOWhka0xKSGwvSzdidC90NzRxRUpicUE1NzNFS0xmc01XQW5TN1VsUTNYbWtZeitIQkY0WFBiQ0UweGdkbXUyCmh1WDZPdTdBSHBoMkxqRFQ2OFVIZFI2YnA3ZVB1NTMvMXpwczA1cHB1ZVhLUlMxWW5iQ0hJUWsxN085c1ZEbk0KcHhLQjZaNTlWYnFhejZRTHZLQStOTnNMYU81NFZRd0RhRk1heEtSL05ybnJjOS94dFZNcS9ucWlvUzNHSjBDYgp1T3g4OCtVWFY0b1ExeDh4S0hGd1ZYWHJxU2VEMkVLZVU1RTRrdFpJaTFRc2k2UmpFeU5MTnR5akU3SnpIWHdICm9JbVd1dlpTUFJDRll4RS8rUUNHc3Q1TlpHNHc1R0FnMi95OXRaaHFnckRqaStrdzhHMHdsaUR0Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K',
  //         'x-cluster-url':
  //           'https://api.kmain.hasselhoff.shoot.canary.k8s-hana.ondemand.com',
  //         'x-k8s-authorization': `Bearer ${auth.token}`,
  //       },
  //       body: null,
  //       method: 'GET',
  //     });
  //     console.log(await t.json());
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  // return (
  //   <>
  //     cluster overview todo
  //     <button onClick={doFetch}>FETCH</button>
  //   </>
  // );

  return (
    <>
      <ClusterOverviewHeader />
      <ClusterNodes />
    </>
  );
}
