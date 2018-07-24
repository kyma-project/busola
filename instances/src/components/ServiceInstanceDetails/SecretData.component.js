import React, { Fragment } from 'react';
import styled from 'styled-components';

const Button = styled.button`
  color: #0a6ed1;
  background: none;
  border: none;
  font-family: '72';
  font-size: 14px;
  font-weight: normal;
  cursor: pointer;
  padding: 9px 0;
`;

const List = styled.ul`
  padding: 0;
  margin: 0;
  list-style-type: none;
`;

const Item = styled.li`
  font-family: 72;
  font-size: 14px;
  line-height: 1.57;
  text-align: left;
  color: #515559;
  word-break: break-all;
`;

const Bold = styled.span`
  font-weight: bold;
`;

export default class SecretModalContent extends React.Component {
  state = {
    encoded: true,
  };

  toggleEncoded = () => {
    this.setState({ encoded: !this.state.encoded });
  };

  populateItems = (data, encoded) => {
    return Object.entries(data).map(([key, value]) => (
      <Item key={key}>
        <Bold>{key}</Bold>: {value}
      </Item>
    ));
  };

  randomizeAsterisks = () => {
    const min = 6;
    const max = 16;

    const count = Math.floor(Math.random() * (max-min+1) + min);
    return "*".repeat(count);
  }

  render() {
    const data = this.props.data;
    const encoded = this.state.encoded;

    let items = [];
    if (encoded) {
      for (const key in data) {
        
        items.push(
          <Item key={`${key}-encoded`}>
            <Bold>{key}</Bold>: {this.randomizeAsterisks()}
          </Item>,
        );
      }
    } else {
      items = this.populateItems(data);
    }

    return (
      <Fragment>
        <List>{items}</List>
        <Button normal first last onClick={this.toggleEncoded}>
          {encoded ? 'Decode' : 'Encode'}
        </Button>
      </Fragment>
    );
  }
}
