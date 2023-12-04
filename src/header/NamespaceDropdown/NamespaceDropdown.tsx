import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';

import { namespacesState } from 'state/namespacesAtom';

import { ComboBoxItem } from '@ui5/webcomponents-react';

export function NamespaceDropdown() {
  const { t } = useTranslation();
  const allNamespaces = useRecoilValue(namespacesState);

  let namespaces = [
    <ComboBoxItem
      text={t('namespaces.namespaces-overview')}
      data-key="overview"
    />,
    <ComboBoxItem
      text={t('navigation.all-namespaces')}
      data-key="all-namespaces"
    />,
  ];

  allNamespaces.map(ns =>
    namespaces.push(<ComboBoxItem text={ns} data-key={ns} />),
  );

  return namespaces;
}
