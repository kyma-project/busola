import styled from 'styled-components';

export const EntriesWrapper = styled.div`
  width: 100%;
  background-color: #fff;
  font-family: '72';
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  min-height: 40px;
  text-align: center;
  font-size: 14px;
  line-height: 40px;
`;

// table styles
export const Element = styled.div`
  font-size: 14px;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.29;
  letter-spacing: normal;
  text-align: left;
  padding: 15px 20px;
  color: ${props => props.color};
  cursor: ${props => (props.pointer ? 'pointer' : 'auto')};
  font-weight: ${props => (props.fontWeight ? props.fontWeight : 'normal')};

  > a {
    text-decoration: none;
    color: ${props => props.color} !important;
  }
`;

export const DeleteAction = styled.div`
  height: 17px;
  width: 16px;
  float: right;
  font-family: SAP-icons;
  font-size: 16px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: center;
  padding: 15px 21px;
  color: #0a6ed1;
  cursor: pointer;
`;

export const GridWrapper = styled.div`
  &:last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    padding-bottom: 20px;
  }
`;

export const HeaderWrapper = styled.div`
  width: 100%;
  background-color: #fff;
  font-family: '72';
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
`;

export const HeaderTitle = styled.div`
  font-size: 16px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  letter-spacing: normal;
  text-align: left;
  color: #32363a;
  padding: 14px 20px;
`;

export const HeaderLink = styled.button`
  display: block;
  background: none;
  border: 0;
  font-size: 14px;
  color: #0a6ed1;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.21;
  letter-spacing: normal;
  text-align: right;
  float: right;
  color: #0a6ed1;
  padding: 14px 15px;
  cursor: pointer;
  text-decoration: none;
`;

export const HeaderButton = styled.button`
  background: none;
  border: 0;
  font-size: 14px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.21;
  letter-spacing: normal;
  text-align: right;
  margin-right: 0;
  color: '#0a6ed1';
  opacity: ${props => props.disabled ? '0.5' : '1' };
  text-decoration: none;
  padding: 14px 15px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
`;

export const HeaderColumnsWrapper = styled.div`
  background-color: rgba(243, 244, 245, 0.45);
`;

export const HeaderColumnsName = styled.div`
  padding: 13px 20px;
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

export const EmptyList = styled.div`
  width: 100%;
  font-family: '72';
  text-align: center;
  font-size: 20px;
  color: #32363a;
  margin: 50px 0;
`;
