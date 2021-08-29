import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { usePost, useNotification } from 'react-shared';

import { CreateForm } from 'shared/components/CreateForm/CreateForm';

import {
  issuerToYaml,
  yamlToIssuer,
  createIssuerTemplate,
  createPresets,
} from './helpers';

import { SimpleForm } from './SimpleForm';
import { AdvancedForm } from './AdvancedForm';

export function IssuersCreate({ onChange, formElementRef, namespace }) {
  const { t } = useTranslation();
  const notification = useNotification();
  const postRequest = usePost();

  const [issuer, setIssuer] = useState(createIssuerTemplate(namespace));
  console.log('issuer', issuer);

  const createIssuer = async () => {
    let createdIssuer = null;
    try {
      createdIssuer = await postRequest(
        `/apis/cert.gardener.cloud/v1alpha1/namespaces/${namespace}/issuers/`,
        issuerToYaml(issuer),
      );
      console.log('created issuer', createdIssuer);
      LuigiClient.linkManager()
        .fromContext('namespace')
        .navigate(`/issuers/details/${issuer.name}`);
    } catch (e) {
      console.error(e);
      notification.notifyError({
        title: t('issuers.messages.failure'),
        content: e.message,
      });
      return false;
    }
    // const createdResourceUID = createdDeployment?.metadata?.uid;
  };

  return (
    <CreateForm
      title={t('issuers.create.title')}
      simpleForm={<SimpleForm issuer={issuer} setIssuer={setIssuer} />}
      advancedForm={<AdvancedForm issuer={issuer} setIssuer={setIssuer} />}
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
