import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { usePost, useNotification } from 'react-shared';

import { CreateForm } from 'shared/components/CreateForm/CreateForm';

import { toYaml, fromYaml, createTemplate } from './helpers';

import { SimpleForm } from './SimpleForm';
import { AdvancedForm } from './AdvancedForm';

export function CertificatesCreate({ onChange, formElementRef, namespace }) {
  const { t } = useTranslation();
  const notification = useNotification();
  const postRequest = usePost();

  const [certificate, setCertificate] = useState(createTemplate(namespace));

  const createCertificate = async () => {
    try {
      await postRequest(
        `/apis/cert.gardener.cloud/v1alpha1/namespaces/${namespace}/certificates/`,
        toYaml(certificate),
      );
      notification.notifySuccess({
        content: t('certificates.create.messages.success'),
      });
      LuigiClient.linkManager()
        .fromContext('namespace')
        .navigate(`/certificates/details/${certificate.name}`);
    } catch (e) {
      console.error(e);
      notification.notifyError({
        title: t('certificates.create.messages.failure'),
        content: e.message,
      });
      return false;
    }
  };

  return (
    <CreateForm
      title={t('certificates.create.title')}
      simpleForm={
        <SimpleForm certificate={certificate} setCertificate={setCertificate} />
      }
      advancedForm={
        <AdvancedForm
          certificate={certificate}
          setCertificate={setCertificate}
        />
      }
      resource={certificate}
      setResource={setCertificate}
      toYaml={toYaml}
      fromYaml={fromYaml}
      onCreate={createCertificate}
      onChange={onChange}
      formElementRef={formElementRef}
    />
  );
}
