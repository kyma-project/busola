import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';

import { namespacesState } from 'state/namespacesAtom';

import './NamespaceDropdown.scss';
import { MenuItem } from '@ui5/webcomponents-react';

const Namespaces = () => {
  const namespaces = useRecoilValue(namespacesState);

  return (
    <>
      {namespaces.map(ns => (
        <MenuItem key={ns} text={ns} />
      ))}
    </>
  );
};

export function NamespaceDropdown() {
  const { t } = useTranslation();

  const namespacesOverviewNode = (
    <MenuItem icon="list" text={t('namespaces.namespaces-overview')} />
  );

  const allNamespacesNode = (
    <MenuItem text={t('navigation.all-namespaces')} icon="dimension" />
  );

  return (
    <>
      {namespacesOverviewNode}
      {allNamespacesNode}
      <Namespaces />
    </>
  );
}
