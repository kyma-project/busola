import React, { Fragment } from 'react';
import { Icon } from '@kyma-project/react-components';
import styled from 'styled-components';
import { Button } from '../Modal/Modal';

const CheckboxInput = styled.input`
  margin-right: 10px;
  position: relative;
  top: -1px;
`;

const CheckboxWrapper = styled.label`
  font-family: 72;
  font-size: 14px;
  line-height: 1.57;
  text-align: left;
  color: #515559;
  word-break: break-all;
`;

const WarningText = styled.p`
  margin: 10px 0 20px 25px;
  font-family: 72;
  font-size: 12px;
  line-height: 1.57;
  text-align: left;
  color: ${props => (props.checked ? '#ee0000' : '#b0b2b4')};
  word-break: normal;
  transition: color ease-out 0.2s;
`;

const IconWrapper = styled.span`
  display: inline-block;
  position: relative;
  top: 1px;
`;

class BindingDeletion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bindingUsageChecked: true,
      bindingChecked: props.bindingExists && props.bindingUsageCount === 1,
    };
  }

  proceed = () => {
    const { bindingUsageChecked, bindingChecked } = this.state;
    this.props.handleDeletion(bindingUsageChecked, bindingChecked);
    this.props.close();
  };

  toggleBinding = () => {
    this.setState({
      bindingChecked: !this.state.bindingChecked,
    });
  };

  toggleBindingUsage = () => {
    this.setState({
      bindingUsageChecked: !this.state.bindingUsageChecked,
    });
  };

  render() {
    const {
      bindingName,
      bindingExists,
      bindingUsageName,
      bindingUsageCount,
      close,
    } = this.props;

    const submitEnabled =
      this.state.bindingChecked || this.state.bindingUsageChecked;

    return (
      <Fragment>
        <div>
          <CheckboxWrapper>
            <CheckboxInput
              type="checkbox"
              onChange={this.toggleBindingUsage}
              checked={this.state.bindingUsageChecked}
            />
            {`Service Binding Usage "${bindingUsageName}"`}
            <WarningText checked={this.state.bindingUsageChecked}>
              <IconWrapper>
                <Icon>{'\uE0B1'}</Icon>
              </IconWrapper>&nbsp;
              <strong>Warning:</strong>
              &nbsp; Removing Service Binding Usage will prevent your
              application from accessing the instance after its restart.
            </WarningText>
          </CheckboxWrapper>

          {bindingExists && (
            <CheckboxWrapper>
              <CheckboxInput
                type="checkbox"
                onChange={this.toggleBinding}
                checked={this.state.bindingChecked}
              />
              {`Service Binding "${bindingName}"`}
              <WarningText checked={this.state.bindingChecked}>
                <IconWrapper>
                  <Icon>{'\uE0B1'}</Icon>
                </IconWrapper>&nbsp;
                <strong>Warning:</strong>
                &nbsp;
                {bindingUsageCount > 1 &&
                  `You have ${bindingUsageCount} Service Binding Usage resources pointing to this Service Binding. `}
                Removing Service Binding will make all related Service Binding
                Usages stop working.
              </WarningText>
            </CheckboxWrapper>
          )}
        </div>

        <Button
          onClick={this.proceed}
          children="Delete"
          warning
          disabled={!submitEnabled}
        />
        <Button onClick={close} children="Cancel" />
      </Fragment>
    );
  }
}

export default BindingDeletion;
