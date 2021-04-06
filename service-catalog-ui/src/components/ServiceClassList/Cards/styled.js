import styled from 'styled-components';
import {
  Panel,
  PanelHeader,
  PanelBody,
  Image,
} from '@kyma-project/react-components';

import { Tile } from 'fundamental-react';

export const CardWrapper = styled.div`
  box-sizing: border-box;
  padding: 10px 0;
  width: 100%;
  flex: 0 1 33.33%;
`;

export const CardContent = styled(Panel)`
  && {
    margin: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
    height: 100%;
    padding: 20px;
    transition: box-shadow 0.125s ease-in;
    box-shadow: 0 5px 20px 0 rgba(50, 54, 58, 0.08);

    &:hover {
      box-shadow: 0 0 5px 0 rgba(106, 109, 112, 0.4);
      cursor: pointer;
    }
  }
`;

export const CardTop = styled(PanelHeader)`
  && {
    display: flex;
    border-bottom: none;
    justify-content: flex-start;
    padding: 0;
    text-align: left;
    margin-bottom: 20px;
  }
`;

export const CardThumbnail = styled(Tile.Media)`
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

export const CardHeaderContent = styled(Tile.Content)`
  && {
    padding: 0;
    margin-left: 20px;
    align-self: flex-start;

    > h3 {
      margin-left: 0px;
      font-size: 16px;
      color: rgb(50, 54, 58);
      font-weight: normal;
    }
  }
`;

export const CardDescription = styled(PanelBody)`
  && {
    flex: 1;
    border-top: none;
    padding: 0;
    text-align: left;
    margin-bottom: 20px;
  }
`;
