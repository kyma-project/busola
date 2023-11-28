import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';

import { namespacesState } from 'state/namespacesAtom';

import { SideNavigationSubItem } from '@ui5/webcomponents-react';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { useMatch, useNavigate } from 'react-router-dom';
import { useUrl } from 'hooks/useUrl';

export function NamespaceChooser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { clusterUrl, namespaceUrl } = useUrl();
  const allNamespaces = useRecoilValue(namespacesState);
  const namespace = useRecoilValue(activeNamespaceIdState);

  const { resourceType = '' } =
    useMatch({
      path: '/cluster/:cluster/namespaces/:namespace/:resourceType',
      end: false,
    })?.params ?? {};

  const getNamespaceLabel = () => {
    if (namespace === '-all-') return t('navigation.all-namespaces');
    else return namespace || t('navigation.select-namespace');
  };

  let namespaces = [
    <SideNavigationSubItem
      text={t('namespaces.namespaces-overview')}
      data-key="overview"
      onClick={() => navigate(clusterUrl(`namespaces`))}
    />,
    <SideNavigationSubItem
      text={t('navigation.all-namespaces')}
      data-key="all-namespaces"
      onClick={() =>
        navigate(namespaceUrl(resourceType, { namespace: '-all-' }))
      }
    />,
  ];

  allNamespaces.map(ns =>
    namespaces.push(
      <SideNavigationSubItem
        text={ns}
        data-key={ns}
        onClick={e =>
          navigate(
            namespaceUrl(resourceType, {
              namespace: e.target.dataset.key ?? undefined,
            }),
          )
        }
      />,
    ),
  );

  return <>{namespaces}</>;
}
