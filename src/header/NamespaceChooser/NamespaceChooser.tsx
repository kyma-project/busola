import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import { useUrl } from 'hooks/useUrl';
import { useMatch, useNavigate } from 'react-router';
import { namespacesState } from 'state/namespacesAtom';

import { SideNavigationSubItem } from '@ui5/webcomponents-react';
import { useFormNavigation } from 'shared/hooks/useFormNavigation';

export function NamespaceChooser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { namespaceUrl } = useUrl();
  const allNamespaces = useRecoilValue(namespacesState);
  const { navigateSafely } = useFormNavigation();

  const { resourceType = '' } =
    useMatch({
      path: '/cluster/:cluster/namespaces/:namespace/:resourceType',
      end: false,
    })?.params ?? {};

  let namespaces = [
    <SideNavigationSubItem
      key="all-namespaces"
      text={t('navigation.all-namespaces')}
      data-key="all-namespaces"
      onClick={() => {
        navigateSafely(() =>
          navigate(namespaceUrl(resourceType, { namespace: '-all-' })),
        );
      }}
    />,
  ];

  allNamespaces?.map(ns =>
    namespaces.push(
      <SideNavigationSubItem
        text={ns}
        key={ns}
        data-key={ns}
        onClick={e => {
          navigateSafely(() =>
            navigate(
              namespaceUrl(resourceType, {
                namespace: e.target.dataset.key ?? undefined,
              }),
            ),
          );
        }}
      />,
    ),
  );

  return <>{namespaces}</>;
}
