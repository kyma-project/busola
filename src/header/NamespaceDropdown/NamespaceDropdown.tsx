import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';

import { namespacesState } from 'state/namespacesAtom';

import { ComboBoxItem } from '@ui5/webcomponents-react';

export function NamespaceDropdown() {
  const { t } = useTranslation();
  const allNamespaces = useRecoilValue(namespacesState);

  let namespaces = [];

  if (allNamespaces.length > 0) {
    namespaces.push(
      <ComboBoxItem
        text={t('navigation.all-namespaces')}
        key="all-namespaces"
        data-key="all-namespaces"
      />,
    );
  }

  allNamespaces.map(ns =>
    namespaces.push(<ComboBoxItem text={ns} key={ns} data-key={ns} />),
  );

  return namespaces;
}
