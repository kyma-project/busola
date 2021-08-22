import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutPanel, Link, FormItem, FormLabel } from 'fundamental-react';
import { goToIssuer, goToSecret } from './helpers';
import './CertificateRefs.scss';

export function CertificateRefs(certificate) {
  const { t } = useTranslation();

  console.log(certificate);

  return (
    <LayoutPanel className="fd-margin--md certificate-refs-panel">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('certificates.refs')} />
      </LayoutPanel.Header>
      <FormItem>
        <FormLabel>Issuer</FormLabel>
        <Link onClick={() => goToIssuer(certificate)}>
          {certificate.status.issuerRef.name}
        </Link>
      </FormItem>
      <FormItem>
        <FormLabel>Secret</FormLabel>
        <Link onClick={() => goToSecret(certificate)}>
          {certificate.spec.secretRef.name}
        </Link>
      </FormItem>
    </LayoutPanel>
  );
}
