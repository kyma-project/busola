import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const TooltipContainer = styled.div`
  position: absolute;
  box-sizing: border-box;
  z-index: 199;
  min-width: ${props => (props.minWidth ? props.minWidth : '150px')};
  max-width: ${props => (props.maxWidth ? props.maxWidth : '420px')};
  background: #fff;
  filter: drop-shadow(rgba(0, 0, 0, 0.12) 0 0px 2px);
  border-radius: 4px;
  bottom: 100%;
  left: 50%;
  padding: 7px;
  margin-bottom: 10px;
  transform: translateX(-50%);
  transition: all 0.3s;
  opacity: 0;

  &:after {
    border: 10px solid;
    border-color: white transparent transparent;
    content: '';
    left: 50%;
    margin-left: -10px;
    position: absolute;
    top: 100%;
  }
`;

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
  z-index: 198;

  &:hover ${TooltipContainer} {
    margin-bottom: 15px;
    opacity: 1;
  }
`;

const TooltipContent = styled.div`
  font-family: '72';
  display: block;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: center;
  color: #32363b;
  font-size: 12px;
  padding: 2px 6px;
`;

class Tooltip extends React.Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  };

  constructor(props) {
    super(props);
    this.state = {
      visibleTooltip: false,
    };
  }

  setVisibility = visible => {
    this.setState({ visibleTooltip: visible });
  };

  handleShowTooltip = () => {
    if (typeof this.setVisibility === 'function') {
      setTimeout(() => this.setVisibility(true), 250);
    }
  };

  handleHideTooltip = () => {
    if (typeof this.setVisibility === 'function') {
      setTimeout(() => this.setVisibility(false), 250);
    }
  };

  render() {
    const { visibleTooltip } = this.state;
    const { children, content } = this.props;

    return (
      <TooltipWrapper
        onMouseEnter={this.handleShowTooltip}
        onMouseLeave={this.handleHideTooltip}
      >
        {children}
        {visibleTooltip && (
          <TooltipContainer
            minWidth={this.props.minWidth}
            maxWidth={this.props.maxWidth}
          >
            <TooltipContent>{content}</TooltipContent>
          </TooltipContainer>
        )}
      </TooltipWrapper>
    );
  }
}

export default Tooltip;
