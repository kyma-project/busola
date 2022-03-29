export const FormattedDate = ({ date, lang }) =>
  Intl.DateTimeFormat(lang, { dateStyle: 'short' }).format(Date.parse(date));

export const FormattedTime = ({ date, lang }) =>
  Intl.DateTimeFormat(lang, { timeStyle: 'short' }).format(Date.parse(date));

export const FormattedDatetime = ({ date, lang }) =>
  Intl.DateTimeFormat(lang, { dateStyle: 'short', timeStyle: 'short' }).format(
    Date.parse(date),
  );
