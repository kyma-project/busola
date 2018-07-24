import styled from 'styled-components';
import { media } from '@kyma-project/react-components';

const ColumnsWrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  align-items: flex-start;
  padding: 0;
  display: flex;
  flex-flow: row nowrap;
  ${props => (props.phoneRows ? media.phone`flex-flow: column nowrap;` : '')};
`;

export default ColumnsWrapper;
