import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';

import { CreateForm } from 'shared/components/CreateForm/CreateForm';

function issuerToYaml(issuer) {
  return {
    apiVersion: 'cert.gardener.cloud/v1alpha1',
    kind: 'Issuer',
    metadata: {
      name: issuer.name,
      namespace: issuer.namespace,
    },
    spec: {
      // acme:
      // server: https://acme-staging-v02.api.letsencrypt.org/directory
      // email: some.user@mydomain.com
      // autoRegistration: true
      // # with 'autoRegistration: true' a new account will be created if the secretRef is not existing
      // privateKeySecretRef:
      // name: issuer-staging-secret
      // namespace: default
      // };
    },
  };
}
function yamlToIssuer(yaml, prevIssuer) {
  return {
    name: jp.value(yaml, '$.metadata.name') || '',
    namespace: jp.value(yaml, '$.metadata.namespace') || '',
  };
}

function createIssuerTemplate(namespaceId) {
  return {
    name: '',
    namespace: namespaceId,
  };
}

function createPresets(namespaceId, t) {
  return [
    {
      name: t('issuers.create.presets.default'),
      value: createIssuerTemplate(namespaceId),
    },
  ];
}

export function IssuersCreate({ onChange, formElementRef, namespace }) {
  const [issuer, setIssuer] = useState({});
  const { t } = useTranslation();

  const createIssuer = () => {};

  return (
    <CreateForm
      title={t('issuers.create.title')}
      simpleForm={'TODO'}
      advancedForm={'TODO'}
      resource={issuer}
      setResource={setIssuer}
      toYaml={issuerToYaml}
      fromYaml={yamlToIssuer}
      onCreate={createIssuer}
      onChange={onChange}
      presets={createPresets(namespace, t)}
      formElementRef={formElementRef}
    />
  );
}
