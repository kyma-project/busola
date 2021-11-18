import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutPanel, FormItem, FormLabel, Token } from 'fundamental-react';
import { EMPTY_TEXT_PLACEHOLDER, Labels } from 'react-shared';

import { IssuerLink } from './IssuerLink';
import { SecretLink } from './SecretLink';

import './CertificateRefs.scss';

const Tokens = ({ tokens }) => (
  <div>
    {tokens.length
      ? tokens.map(scope => (
          <Token
            key={scope}
            buttonLabel=""
            className="y-fd-token y-fd-token--no-button y-fd-token--gap fd-margin-end--tiny"
            readOnly={true}
          >
            {scope}
          </Token>
        ))
      : EMPTY_TEXT_PLACEHOLDER}
  </div>
);

export function CertificateRefs(certificate) {
  const { t } = useTranslation();
  // oauthclientspecpanel
  console.log(certificate);
  return (
    <LayoutPanel className="fd-margin--md certificate-refs-panel">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('certificates.refs')} />
      </LayoutPanel.Header>
      <FormItem>
        <FormLabel>{t('certificates.issuer')}</FormLabel>
        <IssuerLink issuerRef={certificate.status?.issuerRef} />
      </FormItem>
      <FormItem>
        <FormLabel>{t('certificates.secret')}</FormLabel>
        <SecretLink secretRef={certificate.spec?.secretRef} />
      </FormItem>
      <FormItem>
        <FormLabel>{t('certificates.csr')}</FormLabel>
        {certificate.spec?.csr ? certificate.spec.csr : '-'}
      </FormItem>
      {certificate.metadata?.annotations ? (
        <FormItem>
          <FormLabel>{t('certificates.annotations')}</FormLabel>
          <Labels
            labels={certificate.metadata?.annotations}
            shortenLongLabels
          />
        </FormItem>
      ) : null}
      <FormItem>
        <FormLabel>{t('certificates.renew')}</FormLabel>
        {certificate.spec?.renew ? 'yes' : '-'}
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
