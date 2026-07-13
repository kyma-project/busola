import { useTranslation } from 'react-i18next';
import { FormattedDatetime } from 'shared/components/FormattedDate/FormattedDate';
import { Icon } from '@ui5/webcomponents-react';
import useDateNow from 'shared/hooks/useDateNow';

type CertificateDateProps = {
  date: string;
  lang: string;
};
export function CertificateDate({ date, lang }: CertificateDateProps) {
  const { t } = useTranslation();
  const currentDate = useDateNow(10_000);
  const dayInMilliseconds = 1000 * 60 * 60 * 24;
  const dateDifference = (Date.parse(date) - currentDate) / dayInMilliseconds;
  const EXPIRATION_LIMIT = 30;

  if (dateDifference >= EXPIRATION_LIMIT)
    return <FormattedDatetime date={date} lang={lang} />;

  let certificateDetails = {} as {
    tooltipContent: string;
    ariaLabel: string;
    glyph: string;
    colorIndex: string;
  };

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
    <>
      <FormattedDatetime date={date} lang={lang} />
      <Icon
        accessibleName={certificateDetails.ariaLabel}
        name={certificateDetails.glyph}
        title={certificateDetails.tooltipContent}
        className={`bsl-has-color-status-${certificateDetails.colorIndex} bsl-icon-s sap-margin-begin-tiny`}
      />
    </>
  );
}
