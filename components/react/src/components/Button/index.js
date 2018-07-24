/* eslint new-cap:0 no-unused-vars:0 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { media } from '../../commons/style-utils';

const Button = styled.button`
  background-color: ${props =>
    (props.primary && '#0b74de') ||
    (props.secondary && '#fff') ||
    'transparent'};
  color: ${props =>
    (props.primary && '#fff') || (props.remove && '#ee0000') || '#0a6ed1'};
  display: inline-block;
  margin-top: 5px;
  margin-bottom: 5px;
  margin-right: ${props => (props.last ? '0' : '5px')};
  margin-left: ${props => (props.first ? '0' : '5px')};
  padding: 0 20px;
  outline: 0;
  border: ${props => (props.secondary ? '1px solid' : '0')};
  border-radius: 3px;
  text-decoration: none;
  cursor: pointer;
  padding: 9px 16px;
  font-family: '72';
  font-size: 14px;
  font-weight: ${props => (props.normal ? 'normal' : 'bold')};
  ${props => (props.microFullWidth ? media.micro`width: 100%;` : '')};

  &:disabled {
    color: #8d8f92;
    cursor: not-allowed;
  }
`;

export default Button;
