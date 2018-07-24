import styled from 'styled-components';

const Header = styled.p`
  font-family: '72';
  font-size: 16px;
  font-weight: normal;
  color: #32363a;
  margin: ${props => (props.margin ? props.margin : '0')};
`;

/** @component */
export default Header;
