import styled from 'styled-components';

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
`;

export const ModalContent = styled.div`
    height: 250px;
`;

export const ModalFooter = styled.div`
  position: absolute;
  bottom: 20px;
  right: 15px;
`;

export const CloseModal = styled.div`
  position: absolute;
  top: 0;
  right: 20px;
  cursor: pointer;
`;