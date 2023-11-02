import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormattedDatetime } from 'shared/components/FormattedDate/FormattedDate';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';

import './CertificateDate.scss';
import { Icon } from '@ui5/webcomponents-react';

export function CertificateDate({ date, lang }) {
  const { t } = useTranslation();
  const currentDate = Date.now();
  const dayInMilliseconds = 1000 * 60 * 60 * 24;
  const dateDifference = (Date.parse(date) - currentDate) / dayInMilliseconds;
  const EXPIRATION_LIMIT = 30;

  if (dateDifference >= EXPIRATION_LIMIT)
    return <FormattedDatetime date={date} lang={lang} />;

  let certificateDetails = {};

  if (dateDifference < 0) {
    certificateDetails = {
      tooltipContent: t('secrets.certificates.expired'),
      ariaLabel: 'Error',
      glyph: 'message-warning',
      colorIndex: '3',
    };
  } else if (dateDifference < EXPIRATION_LIMIT) {
    let tooltipContent;

    if (dateDifference < 1)
      tooltipContent = t('secrets.certificates.close-expiration');
    else if (Math.floor(dateDifference) === 1)
      tooltipContent = t('secrets.certificates.will-expire', {
        daysToExpire: 1,
        daysForm: 'day',
      });
    else {
      tooltipContent = t('secrets.certificates.will-expire', {
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
    <div className="cert-date-wrapper">
      <FormattedDatetime date={date} lang={lang} />
      <Tooltip content={certificateDetails.tooltipContent} className="tooltip">
        <Icon
          aria-label={certificateDetails.ariaLabel}
          name={certificateDetails.glyph}
          className={`bsl-has-color-status-${certificateDetails.colorIndex} has-tooltip bsl-icon-s`}
        />
      </Tooltip>
    </div>
  );
}
