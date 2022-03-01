import React from 'react';
import { useTranslation } from 'react-i18next';

import { GenericList } from 'react-shared';
import { Tokens } from 'shared/components/Tokens';

export const MatchExpressionsList = ({ expressions }) => {
  const { t, i18n } = useTranslation();
  const headerRenderer = () => [
    t('match-expressions.headers.key'),
    t('match-expressions.headers.operator'),
    t('match-expressions.headers.values'),
  ];

  const rowRenderer = ({ key = '', operator = '', values = [] }) => [
    key,
    operator,
    <Tokens tokens={values} />,
  ];

  return (
    <GenericList
      title={t('match-expressions.title')}
      entries={expressions || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      i18n={i18n}
      showSearchField={false}
    />
  );
};
