import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormattedDatetime,
  ResourceStatus,
  ResourcesList,
  Link,
  Tooltip,
  EMPTY_TEXT_PLACEHOLDER,
} from 'react-shared';
import { Trans } from 'react-i18next';
import { CertificatesCreate } from '../Create/Certificates/Certificates.create';
import { IssuerLink } from '../Details/Certificate/IssuerLink';
import { Icon } from 'fundamental-react';

const ExpirationDate = ({ date, lang }) => {
  const { t } = useTranslation();
  const currentDate = Date.now();
  const dayInMilliseconds = 1000 * 60 * 60 * 24;
  const dateDifference = (Date.parse(date) - currentDate) / dayInMilliseconds;
  const EXPIRATION_LIMIT = 30;

  if (dateDifference > EXPIRATION_LIMIT)
    return <FormattedDatetime date={date} lang={lang} />;

  let certificateDetails = {};

  if (dateDifference < 0) {
    certificateDetails = {
      tooltipContent: t('certificates.tooltips.expired'),
      ariaLabel: 'Error',
      glyph: 'message-warning',
      colorIndex: '3',
    };
  } else if (dateDifference < EXPIRATION_LIMIT && dateDifference > 0) {
    let tooltipContent;

    if (dateDifference < 1)
      tooltipContent = t('certificates.tooltips.close-expiration');
    else if (Math.floor(dateDifference) === 1)
      tooltipContent = t('certificates.tooltips.will-expire', {
        daysToExpire: 1,
        daysForm: 'day',
      });
    else {
      tooltipContent = t('certificates.tooltips.will-expire', {
        daysToExpire: Math.floor(dateDifference),
        daysForm: 'days',
      });
    }

    certificateDetails = {
      tooltipContent,
      ariaLabel: 'Warning',
      glyph: 'message-warning',
      colorIndex: '2',
    };
  }
  return (
    <div
      style={{
        display: 'flex',
      }}
    >
      <p
        style={{
          marginRight: '5px',
        }}
      >
        <FormattedDatetime date={date} lang={lang} />
      </p>
      {Object.keys(certificateDetails).length > 0 ? (
        <Tooltip content={certificateDetails.tooltipContent}>
          <Icon
            ariaLabel={certificateDetails.ariaLabel}
            glyph={certificateDetails.glyph}
            size="s"
            className={`fd-has-color-status-${certificateDetails.colorIndex} has-tooltip`}
          />
        </Tooltip>
      ) : null}
    </div>
  );
};

const CertificatesList = props => {
  const { t, i18n } = useTranslation();

  const customColumns = [
    {
      header: t('certificates.common-name'),
      value: certificate =>
        certificate.status?.commonName || EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('certificates.issuer'),
      value: certificate => (
        <IssuerLink issuerRef={certificate.status?.issuerRef} />
      ),
    },
    {
      header: t('certificates.expiration-date'),
      value: certificate =>
        certificate.status?.expirationDate ? (
          <ExpirationDate
            date={certificate.status.expirationDate}
            lang={i18n.language}
          />
        ) : (
          EMPTY_TEXT_PLACEHOLDER
        ),
    },
    {
      header: t('certificates.state'),
      value: certificate => (
        <ResourceStatus
          status={certificate.status}
          resourceKind="certificates"
          i18n={i18n}
        />
      ),
    },
  ];

  const description = (
    <Trans i18nKey="certificates.description">
      <Link
        className="fd-link"
        url="https://cert-manager.io/docs/concepts/certificate/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      createResourceForm={CertificatesCreate}
      {...props}
    />
  );
};
export default CertificatesList;
