import { CollapsedRowRenderer } from './CollapsedRowRenderer';
import { DefaultRowRenderer } from './DefaultRowRenderer';
import { FilteredEntriesType } from './TableBody';

type RowRendererProps = {
  entry: FilteredEntriesType;
  actions: any[];
  rowRenderer: (entry: FilteredEntriesType, index: number) => any;
  index: number;
  isSelected?: boolean;
  displayArrow: boolean;
  enableColumnLayout: boolean;
};

export const RowRenderer = ({
  entry,
  actions,
  rowRenderer,
  index,
  isSelected,
  displayArrow,
  enableColumnLayout,
}: RowRendererProps) => {
  const filteredActions = actions?.filter((a) =>
    a.skipAction ? !a.skipAction(entry) : true,
  );
  const resolvedRowRenderer = rowRenderer(entry, index);

  if (Array.isArray(resolvedRowRenderer)) {
    return (
      <DefaultRowRenderer
        isSelected={isSelected}
        displayArrow={displayArrow}
        enableColumnLayout={enableColumnLayout}
        entry={entry}
        actions={filteredActions}
        rowRenderer={resolvedRowRenderer}
      />
    );
  }
  return (
    <CollapsedRowRenderer
      isSelected={isSelected}
      displayArrow={displayArrow}
      enableColumnLayout={enableColumnLayout}
      entry={entry}
      actions={filteredActions}
      rowRenderer={resolvedRowRenderer}
    />
  );
};
