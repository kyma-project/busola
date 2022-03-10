import styled from 'styled-components';

import { Icon as DefaultServiceClassIcon } from 'fundamental-react';

export const ServiceClassInfoContentWrapper = styled.div`
  background-color: #fff;
  padding: 0 30px 0 15px;
`;

export const Icon = styled(DefaultServiceClassIcon)`
  && {
    color: '#515559';
  }
`;

export const Image = styled.img`
  && {
    align-self: center;
    max-width: 48px;
  }
`;

export const ServiceClassHeaderTileGrid = styled.div`
  display: grid;
  > div {
    border: none;
  }
`;

export const ExternalLink = styled.a`
  font-family: '72';
  font-size: 14px;
  font-weight: normal;
  color: #167ee6;
  text-decoration: none;

  :hover {
    text-decoration: underline;
  }
`;
