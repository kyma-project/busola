import React from 'react';
import styled from 'styled-components';
import { Button } from '@kyma-project/react-components';

const RelativeWrapper = styled.div`
    position: relative;
    display: inline-block;
`;

const DropdownWrapper = styled.div`
    position: absolute;
    right: 16px;
    display: block;
    padding: 6px;
    width: 200px;
    background: #fff;
    border-radius: 4px;
    color: #32363a;
    z-index: 10;
    display: ${props => props.visible ? 'block' : 'none'};
    box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.1), 0 2px 14px 0 rgba(0, 0, 0, 0.1);
`;


class Dropdown extends React.Component {
  state = {
    visible: false,
  };

  toggleDropdown = () => {
      this.setState({
          visible: !this.state.visible
      })
  };

  collapse = () => {
    this.setState({
      visible: false
    })
  }

  render() {
    const {enabled = true} = this.props;
    const itemId = this.props.name
    ? this.props.name
        .split(' ')
        .join('-')
        .toLowerCase()
    : '';
    return (
      <RelativeWrapper onMouseLeave={this.collapse}>
        <Button onClick={this.toggleDropdown} disabled={!enabled} data-e2e-id={`toggle-${itemId}`}>
          {this.props.name}
        </Button>
        <DropdownWrapper visible={this.state.visible} data-e2e-id={`wrapper-${itemId}`}>
            {this.props.children}
        </DropdownWrapper>
      </RelativeWrapper>
    );
  }
}

export default Dropdown;
