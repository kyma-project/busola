import React from 'react';
import { Icon, LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { useTranslation } from 'react-i18next';

export function CertificatePanel({ name, certificate }) {
  const { t } = useTranslation();
  const { format: formatDate } = new Intl.DateTimeFormat('en');

  const expirationWarning = certificate.notAfter < new Date() && (
    <Icon
      className="fd-has-color-status-2"
      ariaLabel="Warning"
      glyph="message-warning"
      size="s"
    />
  );

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
            <p>
              {formatDate(certificate.notAfter)} {expirationWarning}
            </p>
          }
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
