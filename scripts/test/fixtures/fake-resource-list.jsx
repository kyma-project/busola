/* eslint-disable */
import { useTranslation } from 'react-i18next';
import { Trans } from 'react-i18next';

export function ResourceList({ resourceType, format }) {
  const { t } = useTranslation();

  const columns = [
    { header: t('translation.single-quotes.used') },
    { header: t('translation.double-quotes.used') },
    { header: t(`translation.backtick.used`) },
  ];

  const age = t('translation.multiline.used');

  const statusText = t(`translation.template.used-${format}`);
  const actionText = t('translation.concat.used-' + resourceType);

  return (
    <GenericList
      columns={columns}
      emptyListProps={{
        subtitleText: age,
      }}
    >
      <Trans i18nKey="translation.trans.used">
        This resource has <strong>no items</strong>.
      </Trans>
    </GenericList>
  );
}
