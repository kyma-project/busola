import styled from 'styled-components';

const Text = styled.p`
  font-family: '72';
  font-size: 14px;
  font-weight: ${props => (props.bold ? 'bold' : 'normal')};
  color: #515559;
  line-height: 1.57;
  margin: 0;
`;

/** @component */
export default Text;
