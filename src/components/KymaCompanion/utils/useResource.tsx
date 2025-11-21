import { useAtomValue } from 'jotai';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { prettifyNameSingular } from 'shared/utils/helpers';

export function useCurrentResource() {
  const columnLayout = useAtomValue(columnLayoutAtom);

  const column =
    columnLayout?.endColumn ??
    columnLayout?.midColumn ??
    columnLayout?.startColumn;

  return {
    namespace: column?.namespaceId ?? '',
    resourceType:
      prettifyNameSingular(column?.rawResourceTypeName ?? '') ||
      prettifyNameSingular(column?.resourceType ?? ''),
    groupVersion: column?.apiGroup
      ? `${column?.apiGroup}/${column?.apiVersion}`
      : (column?.apiVersion ?? ''),
    resourceName: column?.resourceName ?? '',
  };
}
