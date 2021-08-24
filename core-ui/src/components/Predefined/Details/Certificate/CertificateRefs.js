import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutPanel, Link, FormItem, FormLabel } from 'fundamental-react';

import { goToSecret } from './helpers';
import { IssuerLink } from './IssuerLink';
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
        <IssuerLink issuerRef={certificate.status.issuerRef} />
      </FormItem>
      <FormItem>
        <FormLabel>Secret</FormLabel>
        <Link onClick={() => goToSecret(certificate.status.secretRef)}>
          {certificate.spec.secretRef.name}
        </Link>
      </FormItem>
    </LayoutPanel>
  );
}
