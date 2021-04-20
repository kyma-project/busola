import styled from 'styled-components';
import { ActionBar as AB } from 'fundamental-react';
import { sizes } from '../../commons';

export const ActionBar = styled(AB)`
  && {
    padding: 30px 30px 0 30px;
    ${props => (props.background ? `background: ${props.background}` : '')};
  }
`;

export const ActionBarBack = styled.div`
  && {
    @media (min-width: 320px) {
      display: block !important;
    }
  }
`;

export const ActionBarHeader = styled.div`
  && {
    padding: 0;
    text-align: left;
    width: auto;
    flex-grow: 1;
    ${props => (props.nowrap ? `white-space: normal` : '')};
  }
`;

export const ActionBarActions = styled.div`
  && {
    align-items: flex-end;
    justify-content: flex-end;
    flex-grow: 1;
    margin-left: 20px;
    @media (min-width: ${sizes.tablet}px) {
      margin-left: 87px;
    }
  }
`;
