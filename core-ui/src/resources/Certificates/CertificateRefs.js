import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutPanel, FormItem, FormLabel } from 'fundamental-react';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Labels } from 'shared/components/Labels/Labels';

import { IssuerLink } from './IssuerLink';
import { SecretLink } from './SecretLink';
import { Tokens } from 'shared/components/Tokens';
import './CertificateRefs.scss';

export function CertificateRefs(certificate) {
  const { t } = useTranslation();

  return (
    <LayoutPanel
      className="fd-margin--md certificate-refs-panel"
      key={'certificate-ref'}
    >
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('certificates.refs')} />
      </LayoutPanel.Header>
      <FormItem>
        <FormLabel>{t('certificates.issuer')}</FormLabel>
        <IssuerLink issuerRef={certificate.status?.issuerRef} />
      </FormItem>
      <FormItem>
        <FormLabel>{t('secrets.name_singular')}</FormLabel>
        <SecretLink secretRef={certificate.spec?.secretRef} />
      </FormItem>
      <FormItem>
        <FormLabel>{t('certificates.csr')}</FormLabel>
        <div className="break-word csr-display">
          {certificate.spec?.csr
            ? certificate.spec.csr
            : EMPTY_TEXT_PLACEHOLDER}
        </div>
      </FormItem>
      {certificate.metadata?.annotations ? (
        <FormItem>
          <FormLabel>{t('common.headers.annotations')}</FormLabel>
          <Labels
            labels={certificate.metadata?.annotations}
            shortenLongLabels
          />
        </FormItem>
      ) : null}
      <FormItem>
        <FormLabel>{t('certificates.renew')}</FormLabel>
        {certificate.spec?.renew ? t('common.yes') : EMPTY_TEXT_PLACEHOLDER}
      </FormItem>
      {certificate.spec?.dnsNames ? (
        <FormItem>
          <FormLabel>{t('certificates.dns-names')}</FormLabel>
          <Tokens tokens={certificate.spec?.dnsNames} />
        </FormItem>
      ) : null}
    </LayoutPanel>
  );
}
