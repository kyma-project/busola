import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';

import { namespacesAtom } from 'state/namespacesAtom';

import { ComboBoxItem } from '@ui5/webcomponents-react';

export function NamespaceDropdown() {
  const { t } = useTranslation();
  const allNamespaces = useAtomValue(namespacesAtom);

  const namespaces = [];

  if (allNamespaces && allNamespaces.length > 0) {
    namespaces.push(
      <ComboBoxItem
        text={t('navigation.all-namespaces')}
        key="all-namespaces"
        data-key="all-namespaces"
      />,
    );
  }

  allNamespaces?.forEach((ns) =>
    namespaces.push(<ComboBoxItem text={ns} key={ns} data-key={ns} />),
  );

  return <>{namespaces}</>;
}
