import React from 'react';
import styled from 'styled-components';

const TooltipWrapper = styled.div`
  box-shadow: 0 0 4px 0 #00000026, 0 12px 20px 0 #00000019;
  border: 0;
  max-width: 400px;
  background: #fff;
  position: absolute;
  right: 5px;
  bottom: 55px;
  cursor: pointer;
  z-index: 100;
  border-radius: 3px;
  border-left: ${props => (props.color ? `6px solid ${props.color}` : 'none')};

  &:after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-width: 10px;
    border-style: solid;
    border-color: #ffffff transparent transparent transparent;
    right: 28px;
  }
`;

const Header = styled.div`
  border-bottom: 1px solid #ccc;
  line-height: 40px;
  font-family: 72;
  font-size: 13px;
  font-weight: bold;
  text-align: left;
  color: #32363a;
  position: relative;
  padding: 0 12px;
  box-sizing: border-box;
`;

const Content = styled.p`
  box-sizing: border-box;
  padding: 12px;
  color: #32363a;
  font-family: 72;
  font-size: 13px;
  font-weight: normal;
  text-align: left;
`;

const Icon = styled.span`
  font-family: SAP-icons;
  color: ${props => props.color || '#000'};
  float: right;
`;

const Tooltip = ({ title, message, color, icon, onClick }) => (
  <TooltipWrapper color={color} onClick={onClick}>
    <Header>
      {title} <Icon color={color}>{icon}</Icon>
    </Header>
    <Content>{message}</Content>
  </TooltipWrapper>
);

export default Tooltip;
