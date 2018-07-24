import React from 'react';
import styled from 'styled-components';
import { Icon } from '@kyma-project/react-components';

export const ModalHeaderText = styled.div`
  height: 50px;
  line-height: 50px;
  font-family: '72';
  font-size: 16px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  letter-spacing: normal;
  text-align: left;
  color: #32363a;
  padding: 0 40px 0 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-bottom: 1px solid #cccccc;
  cursor: help;
  display: block;
  flex-shrink: 0;
`;

export const CloseModal = styled.div`
  position: absolute;
  top: 0;
  right: 20px;
  cursor: pointer;
`;

export const ModalHeader = ({ text, handleModal }) => (
  <ModalHeaderText title={text}>
    {text}
    <CloseModal onClick={handleModal}>
      <Icon>{'\uE03E'}</Icon>
    </CloseModal>
  </ModalHeaderText>
);
