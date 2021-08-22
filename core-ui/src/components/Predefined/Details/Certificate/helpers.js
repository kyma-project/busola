import LuigiClient from '@luigi-project/client';

export const goToIssuer = certificate => {
  const { name, namespace } = certificate.status.issuerRef;
  LuigiClient.linkManager()
    .fromContext('cluster')
    .navigate(`namespaces/${namespace}/issuers/details/${name}`);
};

export const goToSecret = certificate => {
  const { name, namespace } = certificate.spec.secretRef;
  LuigiClient.linkManager()
    .fromContext('cluster')
    .navigate(`namespaces/${namespace}/secrets/details/${name}`);
};
