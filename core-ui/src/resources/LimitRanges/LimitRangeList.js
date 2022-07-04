import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

import { LimitRangeCreate } from './LimitRangeCreate';

export function LimitRangeList(props) {
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
      createResourceForm={LimitRangeCreate}
      {...props}
    />
  );
}
export default LimitRangeList;
