import { Menu, Icon } from 'fundamental-react';
import { useRecoilValue } from 'recoil';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { namespacesState } from 'state/namespacesAtom';
import { useUrl } from 'hooks/useUrl';

import './NamespaceDropdown.scss';

const Namespaces = () => {
  const namespaces = useRecoilValue(namespacesState);
  const { clusterUrl, namespace, namespaceUrl } = useUrl();
  const { pathname } = useLocation();

  const switchNamespace = (namespaceName: string) => {
    if (!pathname.includes('/namespaces/'))
      return clusterUrl(`namespaces/${namespaceName}`);

    const pathElements = pathname
      .substring(pathname.indexOf('namespaces/'))
      .split('/');

    console.log('dupa', pathname);

    const resourceType = pathElements[2];
    const resourceName = pathElements[3];

    if (!resourceName) return pathname.replace(namespace, namespaceName);

    return namespaceUrl(resourceType, { namespace: namespaceName });
  };

  return (
    <>
      {namespaces.map(ns => (
        <Menu.Item key={ns}>
          <Link to={switchNamespace(ns)}>{ns}</Link>
        </Menu.Item>
      ))}
    </>
  );
};

export function NamespaceDropdown({
  hideDropdown,
}: {
  hideDropdown: VoidFunction;
}) {
  const { clusterUrl } = useUrl();
  const { t } = useTranslation();

  const namespacesOverviewNode = (
    <Menu.Item>
      <Link to={clusterUrl(`namespaces`)}>
        <Icon glyph="dimension" className="fd-margin-end--tiny" />
        {t('namespaces.namespaces-overview')}
      </Link>
    </Menu.Item>
  );

  return (
    <Menu>
      <Menu.List onClick={hideDropdown}>
        {namespacesOverviewNode}
        <Namespaces />
      </Menu.List>
    </Menu>
  );
}
