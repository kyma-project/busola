import React from 'react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { useTranslation } from 'react-i18next';
import { CertificateDate } from 'shared/components/CertificateDate/CertificateDate';
import { Panel, Title, Toolbar } from '@ui5/webcomponents-react';

export function CertificatePanel({ name, certificate }) {
  const { t, i18n } = useTranslation();
  const { format: formatDate } = new Intl.DateTimeFormat('en');

  return (
    <Panel
      fixed
      className="fd-margin--md"
      header={
        <Toolbar>
          <Title level="H5">
            {t('secrets.certificate-panel.title', { name })}
          </Title>
        </Toolbar>
      }
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
    </Panel>
  );
}
