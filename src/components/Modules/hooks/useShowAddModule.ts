import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router';
import {
  columnLayoutAtom,
  ColumnState,
  ShowCreate,
} from 'state/columnLayoutAtom';
import { isFormOpenAtom } from 'state/formOpenAtom';

export function useShowAddModule(
  resourceUrl: string,
  createType: 'kyma' | 'community',
) {
  const navigate = useNavigate();
  const setLayoutColumn = useSetAtom(columnLayoutAtom);
  const setIsFormOpen = useSetAtom(isFormOpenAtom);

  return () => {
    setLayoutColumn({
      startColumn: {
        resourceType: 'kymas',
        rawResourceTypeName: 'Kyma',
        namespaceId: 'kyma-system',
        apiGroup: 'operator.kyma-project.io',
        apiVersion: 'v1beta2',
      } as ColumnState,
      midColumn: null,
      endColumn: null,
      layout: 'TwoColumnsMidExpanded',
      showCreate: {
        resourceType: 'kymas',
        rawResourceTypeName: 'Kyma',
        createType,
        resourceUrl,
      } as ShowCreate,
    });

    navigate(
      `${window.location.pathname}?layout=TwoColumnsMidExpanded&showCreate=true&createType=${createType}`,
    );
    setIsFormOpen((state) => ({ ...state, formOpen: true }));
  };
}
