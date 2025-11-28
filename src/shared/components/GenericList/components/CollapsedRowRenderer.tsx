import { useState } from 'react';
import { Button, FlexBox, Icon, TableRow } from '@ui5/webcomponents-react';
import { DefaultRowRenderer } from './DefaultRowRenderer';
import { FilteredEntriesType } from './TableBody';

type CollapsedRowRendererProps = {
  entry: FilteredEntriesType;
  actions: any[];
  rowRenderer: any;
  isSelected?: boolean;
  displayArrow: boolean;
  hasDetailsView: boolean;
  enableColumnLayout: boolean;
};

export const CollapsedRowRenderer = ({
  rowRenderer: {
    title,
    cells,
    collapseContent,
    withCollapseControl = true,
    showCollapseControl = true,
  },
  isSelected,
  displayArrow,
  hasDetailsView,
  enableColumnLayout,
  entry,
  actions,
}: CollapsedRowRendererProps) => {
  const [isOpen, setIsOpen] = useState(false);

  let rowRenderer = cells;
  if (withCollapseControl) {
    rowRenderer = [
      showCollapseControl ? (
        <div style={{ display: 'flex' }}>
          <Button
            data-testid={
              isOpen ? 'collapse-button-open' : 'collapse-button-close'
            }
            design="Transparent"
            onClick={() => setIsOpen(!isOpen)}
          >
            <FlexBox>
              <Icon
                className="sap-margin-end-tiny"
                name={isOpen ? 'navigation-up-arrow' : 'navigation-down-arrow'}
              />
              {title}
            </FlexBox>
          </Button>
        </div>
      ) : (
        <></>
      ),
      ...cells,
    ];
  }

  const defaultRow = (
    <DefaultRowRenderer
      rowRenderer={rowRenderer}
      isSelected={isSelected}
      displayArrow={displayArrow}
      hasDetailsView={hasDetailsView}
      enableColumnLayout={enableColumnLayout}
      entry={entry}
      actions={actions}
    />
  );

  let collapseRow = collapseContent && (
    <TableRow
      role="row"
      className="collapse-content"
      data-testid="collapse-content"
    >
      {collapseContent}
    </TableRow>
  );
  if (withCollapseControl) {
    collapseRow = isOpen ? collapseRow : null;
  }

  return (
    <>
      {defaultRow}
      {collapseRow}
    </>
  );
};
