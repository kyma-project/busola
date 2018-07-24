import React from 'react';
import styled from 'styled-components';
import { Icon } from '@kyma-project/react-components';

const CardWrapper = styled.div`
  box-sizing: border-box;
  padding: 10px 0;
  width: 100%;
  flex: 0 1 33.33%;
`;

const CardContent = styled.div`
  box-sizing: border-box;
  border-radius: 3px;
  background-color: #ffffff;
  border: solid 1px rgba(63, 80, 96, 0.15);
  color: #3f5060;
  font-family: '72';
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  font-size: 14px;
  font-weight: 300;
  padding: 20px;
  margin: 10px;
  height: 100%;
  transition: box-shadow ease-out 0.2s;

  &:hover {
    box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.1), 0 2px 14px 0 rgba(0, 0, 0, 0.1);
    cursor: pointer;
  }
`;

const CardTop = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
`;

const CardThumbnail = styled.div`
  width: 45px;
  height: 45px;
  margin-right: 20px;
  line-height: 45px;
  text-align: center;
  border-radius: 4px;
  background-color: #00b6ff;
  color: #ffffff;
  font-size: 20px;
`;

const CardHeader = styled.div``;

const CardTitle = styled.div`
  font-size: 16px;
`;

const CardCompany = styled.div`
  color: #b2b9bf;
`;

const CardDescription = styled.div``;

function Card(props) {
  const itemId = props.item.title
    ? props.item.title
        .split(' ')
        .join('-')
        .toLowerCase()
    : '';
  return (
    <CardWrapper data-e2e-id="card">
      <CardContent
        onClick={props.onClick}
        data-e2e-id={`go-to-details-${itemId}`}
      >
        <CardTop>
          <CardThumbnail>
            <Icon>{'\ue113'}</Icon>
          </CardThumbnail>
          <CardHeader>
            <CardTitle data-e2e-id="card-title">{props.item.title}</CardTitle>
            <CardCompany>{props.item.company}</CardCompany>
          </CardHeader>
        </CardTop>
        <CardDescription>{props.item.description}</CardDescription>
      </CardContent>
    </CardWrapper>
  );
}

export default Card;
