import React from 'react';
import { useTranslation } from 'react-i18next';

import { GenericList } from 'shared/components/GenericList/GenericList';
import { Tokens } from 'shared/components/Tokens';

export const MatchExpressionsList = ({ expressions }) => {
  const { t } = useTranslation();
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
      searchSettings={{
        showSearchField: false,
      }}
    />
  );
};
