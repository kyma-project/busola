import { List } from '@ui5/webcomponents-react';
import {
  CustomContent,
  ExpandableListItem,
} from '../ExpandableListItem/ExpandableListItem';
import { ReactNode } from 'react';

type ConditionListProps = {
  conditions: [ConditionItem];
  className?: string;
};

type ConditionItem = {
  header: ConditionHeader;
  message?: string;
  customContent?: CustomContent[];
};
type ConditionHeader = {
  titleText: string | ReactNode;
  status?: string;
  overrideStatusType?: string;
};

export const ConditionList = ({
  conditions,
  className,
}: ConditionListProps) => {
  if (!conditions) {
    return null;
  }
  return (
    <List className={className}>
      {conditions?.map((cond, index) => (
        <ExpandableListItem
          key={`${cond.message}-${index}`}
          header={cond.header?.titleText}
          status={cond.header?.status}
          overrideStatusType={cond.header?.overrideStatusType}
          content={cond.message}
          customContent={cond.customContent}
        />
      ))}
    </List>
  );
};
