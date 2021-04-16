import styled from 'styled-components';
import { Image } from '@kyma-project/react-components';

export const CardThumbnail = styled.div`
  && {
    position: relative;
    width: 45px;
    height: 45px;
    min-width: 45px;
    min-height: 45px;
    line-height: 45px;
    text-align: center;
    border-radius: 4px;
    background-color: #f3f4f5;
    border: solid 1px rgba(63, 80, 96, 0.15);
    color: #32363a;
    font-size: 20px;
    padding: 0;
  }
`;

export const CardImage = styled(Image)`
  && {
    max-width: 27px;
    max-height: 27px;
    position: absolute;
    margin: auto;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
`;
