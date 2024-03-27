import {
  CustomListItem,
  FlexBox,
  Icon,
  List,
  Text,
} from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';
import './MessageWithList.scss';

export default function MessageWithList({
  className,
  message,
  items,
  appendix,
}) {
  return (
    <div className={'message-with-list ' + className}>
      <Text>{message}</Text>
      <div style={spacing.sapUiSmallMarginTopBottom}>
        <List>
          {items.map((item, index) => (
            <CustomListItem key={index}>
              <FlexBox
                justifyContent="SpaceBetween"
                alignItems="Center"
                className="list-item-content"
              >
                <Text className="text">{item}</Text>
                <Icon name="navigation-right-arrow" />
              </FlexBox>
            </CustomListItem>
          ))}
        </List>
      </div>
      <Text>{appendix}</Text>
    </div>
  );
}
