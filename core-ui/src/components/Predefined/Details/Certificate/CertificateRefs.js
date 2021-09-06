import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutPanel, FormItem, FormLabel } from 'fundamental-react';

import { IssuerLink } from './IssuerLink';
import { SecretLink } from './SecretLink';

import './CertificateRefs.scss';

export function CertificateRefs(certificate) {
  const { t } = useTranslation();

  return (
    <LayoutPanel className="fd-margin--md certificate-refs-panel">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('certificates.refs')} />
      </LayoutPanel.Header>
      <FormItem>
        <FormLabel>Issuer</FormLabel>
        <IssuerLink issuerRef={certificate.status?.issuerRef} />
      </FormItem>
      <FormItem>
        <FormLabel>Secret</FormLabel>
        <SecretLink secretRef={certificate.spec?.secretRef} />
      </FormItem>
    </LayoutPanel>
  );
}
