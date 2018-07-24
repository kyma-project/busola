import React, { Component, Fragment } from 'react';
import ReactModal from 'react-modal';
import styled from 'styled-components';
import { Separator, Icon } from '@kyma-project/react-components';

const ModalHeaderText = styled.div`
  height: 17px;
  font-family: 72;
  font-size: 16px;
  text-align: left;
  color: #32363a;
  display: inline-block;
  word-break: break-all;
`;

const Header = styled.div`
  padding: 16px 20px;
`;

const Content = styled.div`
  padding: 16px 20px;
  &:after {
    content: '';
    display: block;
    clear: both;
  }
`;

export const Paragraph = styled.p`
  font-family: 72;
  font-size: 14px;
  line-height: 1.57;
  text-align: left;
  color: #515559;
  word-break: break-all;
`;

export const Button = styled.button`
  display: inline-block;
  margin: 5px;
  color: ${props => (props.warning ? '#ee0000' : '#0a6ed1')};
  border: ${props => (props.warning ? '1px #ee0000 solid' : '0')};
  padding: 0 20px;
  border-radius: 3px;
  text-decoration: none;
  cursor: pointer;
  padding: 9px 16px;
  font-family: '72';
  font-size: 14px;
  float: right;

  &:disabled {
    color: #8d8f92;
    border-color: #8d8f92;
    cursor: not-allowed;
  }
`;

const CloseButton = styled.button`
  text-decoration: none;
  cursor: pointer;
  outline: 0;
  border: 0;
  height: 17px;
  font-family: 'SAP-icons';
  font-size: 16px;
  text-align: left;
  color: #32363a;
  display: inline-block;
  float: right;
`;

const ModalOpeningComponent = styled.button`
  font-size: 14px;
  background: transparent;
  border: 0;
  color: ${props => (props.warning ? '#ee0000' : '#0a6ed1')};
  cursor: pointer;
  margin: 15px 20px;
`;

const ModalWrapper = styled.div`
  text-align: ${props => props.align};
`;

const customStyles = {
  content: {
    width: '681px',
    maxHeight: '80%',
    margin: 'auto',
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    padding: '0px',
    position: 'relative',
    top: '50%',
    transform: 'translatey(-50%)',
    boxShadow: '0 20px 32px 0 rgba(0, 0, 0, 0.2), 0 0 2px 0 rgba(0, 0, 0, 0.1)',
  },
};

ReactModal.setAppElement('#root');

export class InformationModal extends Component {
  state = {
    showModal: false,
  };

  handleOpenModal = () => {
    this.setState({ showModal: true });
  };
  handleCloseModal = () => {
    this.setState({ showModal: false });
  };

  render() {
    if (this.props.warning) {
      customStyles.content.borderLeft = '6px solid #ee0000';
    } else {
      customStyles.content.borderLeft = '';
    }

    return (
      <ModalWrapper align="left">
        <ModalOpeningComponent onClick={this.handleOpenModal}>
          {this.props.modalOpeningComponent}
        </ModalOpeningComponent>
        <ReactModal
          isOpen={this.state.showModal}
          onRequestClose={this.handleCloseModal}
          style={customStyles}
        >
          <Header>
            <ModalHeaderText>{this.props.title}</ModalHeaderText>
            <CloseButton onClick={this.handleCloseModal}>
              <Icon>{'\ue03e'}</Icon>
            </CloseButton>
          </Header>
          <Separator />
          <Content>{this.props.content}</Content>
        </ReactModal>
      </ModalWrapper>
    );
  }
}

export class ConfirmationModal extends React.Component {
  state = {
    showModal: false,
  };

  handleOpenModal = () => {
    this.setState({ showModal: true });
  };

  handleCloseModal = () => {
    this.setState({ showModal: false });
  };

  handleConfirmation = async () => {
    try {
      await this.props.handleConfirmation();
      this.handleCloseModal();
    } catch (err) {
      this.handleCloseModal();
    }
  };

  render() {
    let ContentComponent = null;
    if (this.props.contentComponent) {
      ContentComponent = this.props.contentComponent;
    }
    customStyles.content.borderLeft = '6px solid #ee0000';

    return (
      <ModalWrapper align="right">
        <ModalOpeningComponent
          data-e2e-id={`instance-toggle-delete-${this.props.entryName}`}
          onClick={this.handleOpenModal}
          warning={this.props.warning}
        >
          {this.props.modalOpeningComponent}
        </ModalOpeningComponent>
        <ReactModal
          isOpen={this.state.showModal}
          onRequestClose={this.handleCloseModal}
          style={customStyles}
        >
          <Header>
            <ModalHeaderText>{this.props.title}</ModalHeaderText>
            <CloseButton onClick={this.handleCloseModal}>
              <Icon>{'\ue03e'}</Icon>
            </CloseButton>
          </Header>
          <Separator />
          <Content>
            {ContentComponent ? (
              <ContentComponent
                close={this.handleCloseModal}
                {...this.props.contentComponentProps}
              />
            ) : (
              <Fragment>
                <Paragraph>{this.props.message}</Paragraph>
                <Button
                  onClick={this.handleConfirmation}
                  children="Delete"
                  warning
                  data-e2e-id={`instance-delete-${this.props.entryName}`}
                />
                <Button
                  onClick={this.handleCloseModal}
                  children="Cancel"
                  data-e2e-id={`instance-cancel-${this.props.entryName}`}
                />
              </Fragment>
            )}
          </Content>
        </ReactModal>
      </ModalWrapper>
    );
  }
}
