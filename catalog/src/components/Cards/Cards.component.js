import React from 'react';
import styled from 'styled-components';

const CardsWrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  padding: 0 20px 0 0;
`;

const Cards = props => <CardsWrapper>{props.children}</CardsWrapper>;

export default Cards;
