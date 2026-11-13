import { ResourceDetailsForm } from 'shared/components/ResourceDetails/ResourceDetailsForm';
import { ResourceDetailsFormItem } from 'shared/components/ResourceDetails/ResourceDetailsFormItem';
import { useTranslation } from 'react-i18next';
import { CertificateDate } from 'shared/components/CertificateDate/CertificateDate';
import { UI5Card } from 'shared/components/UI5Card/UI5Card';
import { X509Certificate } from '@peculiar/x509';

type CertificatePanelProps = {
  name: string;
  certificate: X509Certificate;
};

export function CertificatePanel({ name, certificate }: CertificatePanelProps) {
  const { t, i18n } = useTranslation();
  const { format: formatDate } = new Intl.DateTimeFormat('en');

  return (
    <UI5Card
      title={t('secrets.certificate-panel.title', { name })}
      accessibleName={t('secrets.accessible-name.certificate-panel')}
    >
      <ResourceDetailsForm>
        <ResourceDetailsFormItem
          label={t('secrets.certificate-panel.subject')}
          value={certificate.subject}
        />
        <ResourceDetailsFormItem
          label={t('secrets.certificate-panel.issuer')}
          value={certificate.issuer}
        />
        <ResourceDetailsFormItem
          label={t('secrets.certificate-panel.valid-since')}
          value={formatDate(certificate.notBefore)}
        />
        <ResourceDetailsFormItem
          label={t('secrets.certificate-panel.expires')}
          value={
            <CertificateDate
              lang={i18n.language}
              date={`${certificate.notAfter}`}
            />
          }
        />
      </ResourceDetailsForm>
    </UI5Card>
  );
}
