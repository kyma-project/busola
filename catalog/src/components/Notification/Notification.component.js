import React from 'react';
import styled from 'styled-components';

const NotificationWrapper = styled.div`
  box-shadow: 0 0 4px 0 #00000026, 0 12px 20px 0 #00000019;
  border: 0;
  max-width: 450px;
  background: #fff;
  position: fixed;
  top: 25px;
  right: ${props => (props.visible ? '30' : '-1000')}px;
  transition: all ease-in-out 0.4s;
  z-index: 1000;
  cursor: pointer;
  border-radius: 3px;
  border-left: ${props => (props.color ? `6px solid ${props.color}` : 'none')};
`;

const Header = styled.div`
  font-family: '72';
  font-size: 13px;
  line-height: 1.31;
  font-weight: bold;
  text-align: left;
  color: #32363a;
  position: relative;
  padding: 12px 12px;
  box-sizing: border-box;
`;

const Icon = styled.span`
  margin-left: 40px;
  font-family: SAP-icons;
  color: ${props => props.color || '#000'};
  float: right;
`;

const Notification = ({ title, color, icon, onClick, visible }) => (
  <NotificationWrapper color={color} onClick={onClick} visible={visible}>
    <Header>
      {title} <Icon color={color}>{icon}</Icon>
    </Header>
  </NotificationWrapper>
);

export default Notification;
