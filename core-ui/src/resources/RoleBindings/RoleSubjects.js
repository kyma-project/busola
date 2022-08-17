import React from 'react';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { useTranslation } from 'react-i18next';
import { SubjectLink } from './SubjectLink';

export const RoleSubjects = binding => {
  const { t } = useTranslation();

  const headerRenderer = () => [
    t('role-bindings.headers.kind'),
    t('common.headers.name'),
    t('common.labels.namespace'),
  ];

  const rowRenderer = subject => [
    subject.kind,
    <SubjectLink subject={subject} />,
    subject.namespace || EMPTY_TEXT_PLACEHOLDER,
  ];

  return (
    <GenericList
      title={t('role-bindings.headers.subjects')}
      key="subjects"
      textSearchProperties={['kind', 'name', 'namespace']}
      entries={binding?.subjects || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
    />
  );
};
