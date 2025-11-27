import { useTranslation } from 'react-i18next';
import {
  TableHeaderRow,
  Text,
  TableHeaderCell,
} from '@ui5/webcomponents-react';

type HeaderRendererProps = {
  actions: any[];
  headerRenderer: () => any;
  disableHiding: boolean;
  noHideFields: string[];
};

export const HeaderRenderer = ({
  actions,
  headerRenderer,
  disableHiding = true,
  noHideFields,
}: HeaderRendererProps) => {
  const { t } = useTranslation();
  let emptyColumn = null;
  const getColumnsLength = () => {
    let columnsLength = headerRenderer().length;
    if (actions?.length) {
      columnsLength += 1;
    }
    return columnsLength;
  };
  if (actions?.length) {
    emptyColumn = (
      <TableHeaderCell
        importance={0}
        popinHidden={true}
        key="actions-column"
        aria-label="actions-column"
        minWidth={`${30 * actions.length}px`}
      >
        <Text />
      </TableHeaderCell>
    );
  }
  const checkCellImportance = (h: string) => {
    if (h === 'Popin') {
      return -1;
    }
    if (Array.isArray(noHideFields) && noHideFields.includes(h)) {
      return 1;
    } else {
      return 0;
    }
  };
  const setCellMinWidth = (h: string) => {
    if (Array.isArray(noHideFields) && noHideFields?.length) {
      return noHideFields.find((field) => field === h)
        ? `calc(100%/${getColumnsLength()})`
        : '100px';
    } else if (h === 'Popin') {
      return '100%';
    } else if (disableHiding && (h === 'Name' || h === '')) {
      return '200px';
    } else if (disableHiding) {
      return 'auto';
    } else {
      return '100px';
    }
  };
  const Header =
    headerRenderer()?.length || emptyColumn ? (
      <TableHeaderRow slot="headerRow">
        {headerRenderer()?.map((h: any, index: number) => {
          return (
            <TableHeaderCell
              key={typeof h === 'object' ? index : h}
              popinText={h === 'Popin' ? t('common.headers.specification') : h}
              popinHidden={h !== 'Popin' && !noHideFields?.includes(h)}
              importance={checkCellImportance(h)}
              minWidth={setCellMinWidth(h)}
              aria-label={`${typeof h === 'object' ? index : h}-column`}
            >
              <Text>{h}</Text>
            </TableHeaderCell>
          );
        })}
        {emptyColumn}
      </TableHeaderRow>
    ) : (
      <></>
    );

  return Header;
};
