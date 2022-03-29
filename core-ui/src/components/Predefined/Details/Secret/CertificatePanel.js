import React from 'react';
import { Icon, LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { useTranslation } from 'react-i18next';

import { Tooltip, FormattedDatetime } from 'react-shared';

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

export function CertificatePanel({ name, certificate }) {
  const { t } = useTranslation();
  const { format: formatDate } = new Intl.DateTimeFormat('en');
  console.log(Date.parse(certificate.notAfter));
  // const expirationWarning = certificate.notAfter < new Date() && (
  //   <Tooltip
  //     delay={0}
  //     position="right"
  //     content={t('secrets.certificate-panel.expiration-warning')}
  //   >
  //     <Icon
  //       className="fd-has-color-status-2"
  //       ariaLabel="Warning"
  //       glyph="message-warning"
  //       size="s"
  //     />
  //   </Tooltip>
  // );

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
          // value={
          //   <p>
          //     {formatDate(certificate.notAfter)} {expirationWarning}
          //   </p>
          // }
          value={<ExpirationDate lang={'en'} date={certificate.notAfter} />}
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
