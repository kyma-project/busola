import React from 'react';
import styled from 'styled-components';
import {Header, Separator, Icon} from '@kyma-project/react-components';
import Grid from 'styled-components-grid';

const CenterSideWrapper = styled.div`
  box-sizing: border-box;
  margin: 30px 0 0;
  text-align: left;
  flex: 0 1 auto;
  display: flex;
  min-height: calc(100% - 30px);
`;

const ContentWrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  text-align: left;
  border-radius: 4px;
  background-color: #ffffff;
  box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.08);
  font-family: '72';
  font-weight: normal;
  border-left: 6px solid #ee0000;
  align-self: stretch;
`;

const ContentHeader = styled.div`
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  line-height: 1.19;
  padding: 16px 20px;
`;

const ContentDescription = styled.div`
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  padding: 20px;
  font-size: 14px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.14;
  letter-spacing: normal;
  text-align: left;
  color: #32363b;
`;

const Element = styled.div`
  padding: 16px 0 10px;
`;

const InfoIcon = styled.button`
  background: transparent;
  border: none;
  line-height: 19px;
  font-family: SAP-icons;
  font-size: 13px;
  float: right;
  color: red;
`;

const GridWrapper = styled(Grid)`
  display: flex;
`;

const ErrorWrapper = styled.div`
  margin: 0 34px;
`;

class Error extends React.Component {

  state = { showError: true };

  hideError = () => {
    this.setState({ showError: false });
  }

  componentWillReceiveProps = () => {
    this.setState({ showError: true });
  }

  render() {
    if(!this.props.error) {
      return null;
    }
    return (
      <ErrorWrapper>
        {this.state.showError ? <GridWrapper>
          <Grid.Unit>
            <CenterSideWrapper>
              <ContentWrapper>
                <ContentHeader>
                  <Grid>
                    <Grid.Unit size={0.9}>
                      <Header>Error</Header>
                    </Grid.Unit>
                    <Grid.Unit size={0.1}>
                      <InfoIcon onClick={this.hideError}>
                        <Icon>{'\ue03e'}</Icon>
                      </InfoIcon>
                    </Grid.Unit>
                  </Grid>
                </ContentHeader>
                <Separator />
                <ContentDescription>
                  <Element>{this.props.error.message}</Element>
                </ContentDescription>
              </ContentWrapper>
            </CenterSideWrapper>
          </Grid.Unit>
        </GridWrapper> : null}
      </ErrorWrapper>
    );
  }
}

export default Error;
