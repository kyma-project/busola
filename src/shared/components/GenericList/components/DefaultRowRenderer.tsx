import {
  TableCell,
  TableRow,
  TableRowActionNavigation,
} from '@ui5/webcomponents-react';
import ListActions from 'shared/components/ListActions/ListActions';
import { FilteredEntriesType } from './TableBody';

type DefaultRowRendererProps = {
  entry: FilteredEntriesType;
  actions: any[];
  rowRenderer: JSX.Element[];
  isSelected?: boolean;
  displayArrow: boolean;
  enableColumnLayout: boolean;
};

export const DefaultRowRenderer = ({
  entry,
  actions,
  rowRenderer,
  isSelected = false,
  displayArrow = false,
  enableColumnLayout = false,
}: DefaultRowRendererProps) => {
  const cells = rowRenderer.map((cell: JSX.Element | any, id: number) => {
    if (cell?.content) {
      const { content, ...props } = cell;
      return (
        <TableCell key={id} {...props}>
          {content}
        </TableCell>
      );
    } else {
      return <TableCell key={id}>{cell}</TableCell>;
    }
  });
  const actionsCell = (
    <TableCell
      horizontalAlign="Right"
      style={{
        paddingRight: enableColumnLayout ? '0' : '0.5rem',
      }}
    >
      <ListActions actions={actions} entry={entry} />
    </TableCell>
  );

  return (
    <TableRow
      className={isSelected ? 'row-selected' : 'row'}
      interactive={enableColumnLayout}
      navigated={isSelected}
      actions={displayArrow && <TableRowActionNavigation />}
    >
      {cells}
      {!!actions?.length && actionsCell}
    </TableRow>
  );
};
