import { useTranslation } from 'react-i18next';

type FormattedDateProps = {
  date: string;
  lang?: string;
};

export const FormattedDate = ({ date, lang }: FormattedDateProps) =>
  Intl.DateTimeFormat(lang, { dateStyle: 'short' }).format(Date.parse(date));

export const FormattedTime = ({ date, lang }: FormattedDateProps) =>
  Intl.DateTimeFormat(lang, { timeStyle: 'short' }).format(Date.parse(date));

export const FormattedDatetime = ({ date, lang }: FormattedDateProps) => {
  const { t } = useTranslation();
  try {
    return Intl.DateTimeFormat(lang, {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(Date.parse(date));
  } catch {
    return t('common.tooltips.unknown-date');
  }
};
