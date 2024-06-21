import { List } from '@ui5/webcomponents-react';
import {
  CustomContent,
  ExpandableListItem,
} from '../ExpandableListItem/ExpandableListItem';

type ConditionListProps = {
  conditions: [ConditionItem];
};

type ConditionItem = {
  message: string;
  header: ConditionHeader;
  customContent?: CustomContent[];
};
type ConditionHeader = {
  titleText: string;
  status?: string;
};

export const ConditionList = ({ conditions }: ConditionListProps) => {
  if (!conditions) {
    return null;
  }
  return (
    <List>
      {conditions?.map((cond, index) => (
        <ExpandableListItem
          key={index}
          header={cond.header?.titleText}
          status={cond.header?.status}
          content={cond.message}
          customContent={cond.customContent}
        />
      ))}
    </List>
  );
};
