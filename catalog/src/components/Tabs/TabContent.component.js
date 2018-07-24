import React from 'react';
import styled from 'styled-components';

const TabsContentWrapper = styled.div`
  ${props => (props.active ? 'display: block;' : 'display: none;')};
`;
function TabContent(props) {
  return (
    <TabsContentWrapper
      active={props.active === props.title}
      data-e2e-id={`docs-content-${props.title} ${
        props.active === props.title ? 'active' : ''
      }`}
    >
      {props.children}
    </TabsContentWrapper>
  );
}

export default TabContent;
