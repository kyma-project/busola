import React from 'react';
import Grid from 'styled-components-grid';
import {
  HeaderWrapper,
  HeaderTitle,
  HeaderColumnsWrapper,
  HeaderColumnsName,
} from '../shared/component-styles';

const InstanceHeader = () => {
  return (
  <HeaderWrapper>
    <Grid>
      <Grid.Unit size={1}>
        <HeaderTitle>Manage Service Instances</HeaderTitle>
      </Grid.Unit>
    </Grid>
    <HeaderColumnsWrapper  data-e2e-id={'instances-header'}>
      <Grid>
        <Grid.Unit size={0.2}>
          <HeaderColumnsName>Name</HeaderColumnsName>
        </Grid.Unit>
        <Grid.Unit size={0.2}>
          <HeaderColumnsName>Service Class</HeaderColumnsName>
        </Grid.Unit>
        <Grid.Unit size={0.2}>
          <HeaderColumnsName>Plan</HeaderColumnsName>
        </Grid.Unit>
        <Grid.Unit size={0.2}>
          <HeaderColumnsName>Bindings</HeaderColumnsName>
        </Grid.Unit>
        <Grid.Unit size={0.1}>
          <HeaderColumnsName>Status</HeaderColumnsName>
        </Grid.Unit>
        <Grid.Unit size={0.1}>
          <HeaderColumnsName />
        </Grid.Unit>
      </Grid>
    </HeaderColumnsWrapper>
  </HeaderWrapper>
)};

export default InstanceHeader;
