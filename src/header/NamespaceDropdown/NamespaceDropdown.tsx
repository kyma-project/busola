import { Menu, Icon } from 'fundamental-react';
import { useRecoilValue } from 'recoil';
import { Link, useMatch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { namespacesState } from 'state/namespacesAtom';
import { useUrl } from 'hooks/useUrl';

import './NamespaceDropdown.scss';

const Namespaces = () => {
  const namespaces = useRecoilValue(namespacesState);
  const { namespaceUrl } = useUrl();

  const { resourceType = '' } =
    useMatch({
      path: '/cluster/:cluster/namespaces/:namespace/:resourceType',
      end: false,
    })?.params ?? {};

  return (
    <>
      {namespaces.map(ns => (
        <Menu.Item key={ns}>
          <Link
            to={namespaceUrl(resourceType, {
              namespace: ns,
            })}
          >
            {ns}
          </Link>
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
