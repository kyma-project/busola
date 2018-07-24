import React from 'react';
import styled from 'styled-components';

const IconWrapper = styled.span`
  font-family: SAP-icons;
`;

const Icon = props => (
  <IconWrapper data-e2e-id="icon">{props.children}</IconWrapper>
);
export default Icon;
