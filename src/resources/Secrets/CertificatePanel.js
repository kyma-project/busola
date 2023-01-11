import React from 'react';
import { LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { useTranslation } from 'react-i18next';
import { CertificateDate } from 'shared/components/CertificateDate/CertificateDate';

export function CertificatePanel({ name, certificate }) {
  const { t, i18n } = useTranslation();
  const { format: formatDate } = new Intl.DateTimeFormat('en');

  return (
    <LayoutPanel className="fd-margin--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={t('secrets.certificate-panel.title', { name })}
        />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
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
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
