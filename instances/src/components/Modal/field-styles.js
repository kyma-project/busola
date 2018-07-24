import styled from 'styled-components';

export const FieldWrapper = styled.div`
  margin: 25px 20px;
`;

export const Label = styled.label`
  width: 100%;
  font-family: '72';
  font-size: 14px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.14;
  letter-spacing: normal;
  text-align: left;
  color: #32363b;
`;

export const Input = styled.input`
  &[type='text'] {
    font-size: 14px;
    border-radius: 4px;
    background-color: #ffffff;
    border: solid 1px rgba(50, 54, 58, 0.15);
    width: 100%;
    height: 36px;
    margin-top: 10px;
    padding-left: 10px;
    box-sizing: border-box;
  }
  
  &[type='text']::-webkit-input-placeholder {
    font-style: italic;
    color: #32363b;
    opacity: 0.5;
  }
  
  &[type='checkbox'] {
    margin-left: 0;
    margin-right: 10px;
  }
`;

export const Select = styled.select`
  margin-top: 10px;
  font-size: 14px;
  width: 100%;
  height: 36px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.4);
  border: solid 1px rgba(50, 54, 58, 0.15);
`;

export const CheckboxWrapper = styled.div`
  width: 100%;
  font-family: '72';
  font-size: 12px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.29;
  letter-spacing: normal;
  text-align: left;
  color: #32363b;
  margin: 25px 20px;
`;