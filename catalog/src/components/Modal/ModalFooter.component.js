import React from 'react';
import styled from 'styled-components';
import { Button } from '@kyma-project/react-components';

const SubmitButton = styled.button`
  position: relative;
  background-color: #0b74de;
  border: 1px solid #0b74de;
  display: inline-block;
  margin: 5px;
  outline: 0;
  border-radius: 3px;
  text-decoration: none;
  cursor: pointer;
  padding: 9px 16px;
  font-family: '72';
  font-size: 14px;
  color: #fff;

  > span {
    transition: opacity 0.2s ease-out;
    opacity: ${props => (props.loading ? '0' : '1')};
  }

  &:disabled {
    color: #8d8f92;
    cursor: not-allowed;
  }

  &:after {
    transition: opacity 0.2s ease-out;
    opacity: ${props => (props.loading ? '1' : '0')};
    content: '\uE00A';
    position: absolute;
    width: 20px;
    height: 16px;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    display: block;
    font-family: SAP-Icons;
    color: #fff;
    transform-origin: 50% 50%;
    animation: spin 4s infinite linear;
  }

  @keyframes spin {
    0% {
      -webkit-transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
    }
  }
`;

export const ModalFooter = styled.div`
  text-align: right;
  padding: 10px 15px;
  display: block;
  flex-shrink: 0;
`;

export const ModalFooterFirst = ({
  disabledNextButton,
  handleModal,
  handleStep,
}) => (
  <ModalFooter>
    <Button normal onClick={handleModal} data-e2e-id="modal-cancel">
      Cancel
    </Button>
    <Button
      disabled={disabledNextButton}
      secondary
      onClick={handleStep}
      data-e2e-id="modal-next"
    >
      Next
    </Button>
  </ModalFooter>
);

export const ModalFooterSecond = ({
  close,
  handleStep,
  create,
  loading,
  children,
}) => (
  <ModalFooter>
    {children}
    <Button normal onClick={close} data-e2e-id="modal-cancel">
      Cancel
    </Button>
    <Button secondary onClick={handleStep} data-e2e-id="modal-previous">
      Previous
    </Button>
    <SubmitButton
      primary
      onClick={create}
      disabled={loading}
      loading={loading}
      data-e2e-id="modal-create"
    >
      <span>Create</span>
    </SubmitButton>
  </ModalFooter>
);
