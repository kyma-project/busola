import LuigiClient from '@luigi-project/client';

export const goToIssuer = ({ name, namespace }) =>
  LuigiClient.linkManager()
    .fromContext('cluster')
    .navigate(`namespaces/${namespace}/issuers/details/${name}`);

export const goToSecret = ({ name, namespace }) =>
  LuigiClient.linkManager()
    .fromContext('cluster')
    .navigate(`namespaces/${namespace}/secrets/details/${name}`);
