import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import { useUrl } from 'hooks/useUrl';
import { useMatch, useNavigate } from 'react-router-dom';
import { namespacesState } from 'state/namespacesAtom';

import { SideNavigationSubItem } from '@ui5/webcomponents-react';

export function NamespaceChooser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { clusterUrl, namespaceUrl } = useUrl();
  const allNamespaces = useRecoilValue(namespacesState);

  const { resourceType = '' } =
    useMatch({
      path: '/cluster/:cluster/namespaces/:namespace/:resourceType',
      end: false,
    })?.params ?? {};

  let namespaces = [
    <SideNavigationSubItem
      key="namespaces-overview"
      text={t('namespaces.namespaces-overview')}
      data-key="overview"
      onClick={() => navigate(clusterUrl(`namespaces`))}
    />,
    <SideNavigationSubItem
      key="all-namespaces"
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
        key={ns}
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
