import React from 'react';
import { EMPTY_TEXT_PLACEHOLDER, ResourcesList } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { LimitRangesCreate } from '../Create/LimitRanges/LimitRanges.create';

const LimitRangesList = props => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('limit-ranges.headers.max'),
      value: limit =>
        limit.spec.limits?.[0]?.max?.memory || EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('limit-ranges.headers.min'),
      value: limit =>
        limit.spec.limits?.[0]?.min?.memory || EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('limit-ranges.headers.default'),
      value: limit =>
        limit.spec.limits?.[0]?.default?.memory || EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('limit-ranges.headers.default-request'),
      value: limit =>
        limit.spec.limits?.[0]?.defaultRequest?.memory ||
        EMPTY_TEXT_PLACEHOLDER,
    },
  ];

  return (
    <ResourcesList
      resourceName={t('limit-ranges.title')}
      customColumns={customColumns}
      createResourceForm={LimitRangesCreate}
      {...props}
    />
  );
};
export default LimitRangesList;
