import React from 'react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { useTranslation } from 'react-i18next';
import { CertificateDate } from 'shared/components/CertificateDate/CertificateDate';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';

export function CertificatePanel({ name, certificate }) {
  const { t, i18n } = useTranslation();
  const { format: formatDate } = new Intl.DateTimeFormat('en');

  return (
    <UI5Panel
      fixed
      className="fd-margin--md"
      title={t('secrets.certificate-panel.title', { name })}
    >
      <LayoutPanelRow
        name={t('secrets.certificate-panel.subject')}
        value={certificate.subject}
      />
      <LayoutPanelRow
        name={t('secrets.certificate-panel.issuer')}
        value={certificate.issuer}
      />
      <LayoutPanelRow
        name={t('secrets.certificate-panel.valid-since')}
        value={formatDate(certificate.notBefore)}
      />
      <LayoutPanelRow
        name={t('secrets.certificate-panel.expires')}
        value={
          <CertificateDate lang={i18n.language} date={certificate.notAfter} />
        }
      />
    </UI5Panel>
  );
}
