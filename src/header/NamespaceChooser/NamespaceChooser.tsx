import { useRecoilState, useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import { useUrl } from 'hooks/useUrl';
import { useMatch, useNavigate } from 'react-router-dom';
import { namespacesState } from 'state/namespacesAtom';

import { SideNavigationSubItem } from '@ui5/webcomponents-react';
import { isResourceEditedState } from 'state/resourceEditedAtom';
import { isFormOpenState } from 'state/formOpenAtom';

export function NamespaceChooser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { namespaceUrl } = useUrl();
  const allNamespaces = useRecoilValue(namespacesState);
  const [isResourceEdited, setIsResourceEdited] = useRecoilState(
    isResourceEditedState,
  );
  const [isFormOpen, setIsFormOpen] = useRecoilState(isFormOpenState);

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
        if (isFormOpen.formOpen) {
          setIsResourceEdited({
            ...isResourceEdited,
            discardAction: () =>
              navigate(namespaceUrl(resourceType, { namespace: '-all-' })),
          });
          setIsFormOpen({ formOpen: true, leavingForm: true });
          return;
        }
        navigate(namespaceUrl(resourceType, { namespace: '-all-' }));
      }}
    />,
  ];

  allNamespaces.map(ns =>
    namespaces.push(
      <SideNavigationSubItem
        text={ns}
        key={ns}
        data-key={ns}
        onClick={e => {
          console.log('tu');
          if (isFormOpen.formOpen) {
            setIsResourceEdited({
              ...isResourceEdited,
              discardAction: () =>
                navigate(
                  namespaceUrl(resourceType, {
                    namespace: e.target.dataset.key ?? undefined,
                  }),
                ),
            });
            setIsFormOpen({ formOpen: true, leavingForm: true });
            return;
          }
          navigate(
            namespaceUrl(resourceType, {
              namespace: e.target.dataset.key ?? undefined,
            }),
          );
        }}
      />,
    ),
  );

  return <>{namespaces}</>;
}
