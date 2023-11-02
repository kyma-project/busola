import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';

import { namespacesState } from 'state/namespacesAtom';

import { StandardListItem } from '@ui5/webcomponents-react';

export function NamespaceDropdown() {
  const { t } = useTranslation();
  const allNamespaces = useRecoilValue(namespacesState);

  let namespaces = [
    <StandardListItem icon="list" data-key="overview">
      {t('namespaces.namespaces-overview')}
    </StandardListItem>,
    <StandardListItem icon="dimension" data-key="all-namespaces">
      {t('navigation.all-namespaces')}
    </StandardListItem>,
  ];

  allNamespaces.map(ns =>
    namespaces.push(<StandardListItem data-key={ns}>{ns}</StandardListItem>),
  );

  return namespaces;
}
