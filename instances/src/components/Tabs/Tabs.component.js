import React from 'react';
import styled from 'styled-components';
import { Separator } from '@kyma-project/react-components';

const TabsWrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  margin: 0;
  font-family: '72';
  font-weight: normal;
`;
const TabsLinkWrapper = styled.div`
  margin: 0 5px;
`;
const TabLink = styled.button`
  margin: 0 15px;
  padding: 19px 0 15px;
  border: none;
  position: relative;
  color: ${props => (props.active ? '#0a6ed1' : '#32363b')};
  font-size: 14px;
  outline: none;
  ${props => (props.active ? 'color:#0a6ed1;' : 'color:#32363b;')};
  &:first-letter {
    text-transform: uppercase;
  }
  &:after {
    ${props => (props.active ? 'content:"";' : '')}
    bottom: 0;
    display: block;
    position: absolute;
    height: 3px;
    width: 100%;
    border-radius: 2px;
    background-color: #0b74de;
  }
  &:hover {
    color: #0a6ed1;
    cursor: pointer;
    &:after {
      content: '';
      bottom: 0;
      display: block;
      position: absolute;
      height: 3px;
      width: 100%;
      border-radius: 2px;
      background-color: #0b74de;
    }
  }
`;
const TabsContentWrapper = styled.div`
  margin: 20px;
  font-size: 14px;
  color: #515559;
  line-height: 1.57;
`;
function Tabs(props) {
  let onClick = clickedItem => {
    props.callbackParent(clickedItem);
  };
  return (
    <div>
      <TabsWrapper>
        <TabsLinkWrapper>
          {props.items.map(item => (
            <TabLink
              key={item}
              onClick={() => onClick(item)}
              active={props.active === item}
            >
              {item}
            </TabLink>
          ))}
        </TabsLinkWrapper>
        <Separator />
        <TabsContentWrapper>{props.children}</TabsContentWrapper>
      </TabsWrapper>
    </div>
  );
}

export default Tabs;
