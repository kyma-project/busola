import styled from 'styled-components';
import { Button as fdbutton } from 'fundamental-react';

export const Button = styled(fdbutton)`
  float: right;
`;

export const List = styled.ul`
  padding: 0;
  margin: 0;
  list-style-type: none;
`;

export const Item = styled.li`
  font-family: 72;
  font-size: 14px;
  line-height: 1.57;
  text-align: left;
  color: #515559;
  word-break: break-word;
`;

export const Text = styled.p`
  font-family: 72;
  font-size: 14px;
  line-height: 1.57;
  text-align: left;
  color: #515559;
  margin-bottom: 20px;
`;

export const Bold = styled.span`
  font-weight: bold;
  white-space: nowrap;
`;

export const SecretKey = styled.span`
  font-weight: bold;
  word-break: break-all;

  display: inline-block;
  margin-right: 8px;
  margin-bottom: 8px;
`;

export const CenterVertically = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
`;
