import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { usePost, useNotification } from 'react-shared';

import { CreateForm } from 'shared/components/CreateForm/CreateForm';

import { toYaml, fromYaml, createTemplate } from './helpers';

import { SimpleForm } from './SimpleForm';
import { AdvancedForm } from './AdvancedForm';

export function IssuersCreate({ onChange, formElementRef, namespace }) {
  const { t } = useTranslation();
  const notification = useNotification();
  const postRequest = usePost();

  const [issuer, setIssuer] = useState(createTemplate(namespace));

  const createIssuer = async () => {
    try {
      await postRequest(
        `/apis/cert.gardener.cloud/v1alpha1/namespaces/${namespace}/issuers/`,
        toYaml(issuer),
      );
      notification.notifySuccess({
        content: t('issuers.create.messages.success'),
      });
      LuigiClient.linkManager()
        .fromContext('namespace')
        .navigate(`/issuers/details/${issuer.name}`);
    } catch (e) {
      console.error(e);
      notification.notifyError({
        title: t('issuers.create.messages.failure'),
        content: e.message,
      });
      return false;
    }
  };

  return (
    <CreateForm
      title={t('issuers.create.title')}
      simpleForm={<SimpleForm issuer={issuer} setIssuer={setIssuer} />}
      advancedForm={<AdvancedForm issuer={issuer} setIssuer={setIssuer} />}
      resource={issuer}
      setResource={setIssuer}
      toYaml={toYaml}
      fromYaml={fromYaml}
      onCreate={createIssuer}
      onChange={onChange}
      formElementRef={formElementRef}
    />
  );
}
