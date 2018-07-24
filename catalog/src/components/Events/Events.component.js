import React from 'react';
import styled from 'styled-components';
import Grid from 'styled-components-grid';

const HeaderWrapper = styled.div`
  width: 100%;
  background-color: #fff;
  font-family: '72';
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
`;

const HeaderTitle = styled.div`
  font-size: 16px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  letter-spacing: normal;
  text-align: left;
  color: #32363a;
  padding: 14px 0;
`;

const HeaderColumnsWrapper = styled.div`
  background-color: rgba(243, 244, 245, 0.45);
`;

const HeaderColumnsName = styled.div`
  padding: 13px;
  height: 13px;
  opacity: 0.6;
  font-size: 11px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  letter-spacing: normal;
  text-align: left;
  color: #32363a;
  text-transform: uppercase;
`;

const Element = styled.div`
  height: auto;
  font-size: 14px;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.29;
  letter-spacing: normal;
  text-align: left;
  padding: 15px 13px;
  color: ${props => props.color};
  font-weight: ${props => (props.fontWeight ? props.fontWeight : 'normal')};
  white-space: pre-wrap;
  white-space: -moz-pre-wrap;
  white-space: -o-pre-wrap;
  word-wrap: break-word;
`;

const GridWrapper = styled.div`
  &:last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    padding-bottom: 20px;
  }
`;

const Code = styled.code`
  width: 100%;
  white-space: pre-wrap;
  white-space: -moz-pre-wrap;
  white-space: -o-pre-wrap;
  word-wrap: break-word;
`;

function Events(props) {
  const topics = [];
  if (props.topics && props.topics.length) {
    props.topics.map(topic => {
      const lastDotIndex = topic.lastIndexOf('.');
      return (topics[topic] = {
        name: topic.substring(0, lastDotIndex),
        version: topic.substring(lastDotIndex + 1, topic.length),
      });
    });
  }
  return (
    <div>
      <h1>{props.title}</h1>
      <p>{props.description}</p>

      <HeaderWrapper>
        <Grid>
          <Grid.Unit size={0.75}>
            <HeaderTitle>Topics</HeaderTitle>
          </Grid.Unit>
        </Grid>
        <HeaderColumnsWrapper>
          <Grid>
            <Grid.Unit size={0.15}>
              <HeaderColumnsName>Name</HeaderColumnsName>
            </Grid.Unit>
            <Grid.Unit size={0.1}>
              <HeaderColumnsName>Version</HeaderColumnsName>
            </Grid.Unit>
            <Grid.Unit size={0.3}>
              <HeaderColumnsName>Description</HeaderColumnsName>
            </Grid.Unit>
            <Grid.Unit size={0.45}>
              <HeaderColumnsName>Payload</HeaderColumnsName>
            </Grid.Unit>
          </Grid>
        </HeaderColumnsWrapper>
      </HeaderWrapper>
      {props.topics &&
        props.topics.map(topic => (
          <GridWrapper key={topic}>
            <Grid>
              <Grid.Unit size={0.15}>
                <Element color={'#0b74de'} fontWeight={'bold'}>
                  {topics[topic].name}
                </Element>
              </Grid.Unit>
              <Grid.Unit size={0.1}>
                <Element color={'#0b74de'}>{topics[topic].version}</Element>
              </Grid.Unit>
              <Grid.Unit size={0.3}>
                <Element color={'#32363b'}>
                  {props.data[topic].subscribe.summary}
                </Element>
              </Grid.Unit>
              <Grid.Unit size={0.45}>
                <Element color={'#32363b'}>
                  <Code>
                    {JSON.stringify(
                      props.data[topic].subscribe.payload,
                      undefined,
                      2,
                    )}
                  </Code>
                </Element>
              </Grid.Unit>
            </Grid>
          </GridWrapper>
        ))}
    </div>
  );
}

export default Events;
