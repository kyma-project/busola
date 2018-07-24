import React from 'react';
import styled from 'styled-components';

const TabsContentWrapper = styled.div`
  ${props => (props.active ? 'display: block;' : 'display: none;')};
`;
function TabContent(props) {
  return (
    <TabsContentWrapper active={props.active === props.title}>
      {props.children}
    </TabsContentWrapper>
  );
}

export default TabContent;
