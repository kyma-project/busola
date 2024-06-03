import { List } from '@ui5/webcomponents-react';
import { ExpandableListItem } from '../ExpandableListItem/ExpandableListItem';

export const ConditionList = ({ conditions }) => {
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
        />
      ))}
    </List>
  );
};
