import React from 'react';
import PropTypes from 'prop-types';
import { TabContainer, Tab } from '@ui5/webcomponents-react';

import './Tabs.scss';

export class Tabs extends React.Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
    defaultActiveTabIndex: PropTypes.number,
    callback: PropTypes.func,
    className: PropTypes.string,
    hideSeparator: PropTypes.bool,
  };

  static defaultProps = {
    defaultActiveTabIndex: 0,
    callback: () => {},
    hideSeparator: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      activeTabIndex: this.props.defaultActiveTabIndex,
    };
  }

  renderTab = children => {
    return React.Children.map(children, (child, index) => {
      return (
        <Tab
          text={child.props.title}
          key={child.props.title}
          selected={index === this.state.activeTabIndex}
        >
          {child.props.children}
        </Tab>
      );
    });
  };

  render() {
    const children = this.props.children.filter(child => child);

    return (
      <>
        <TabContainer onTabSelect={function ka() {}}>
          {this.renderTab(children)}
        </TabContainer>
      </>
    );
  }
}
