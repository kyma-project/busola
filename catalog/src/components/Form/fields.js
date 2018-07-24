import React from 'react';
import styled from 'styled-components';

const FieldErrorMessage = styled.p`
  font-family: '72';
  font-size: 12px;
  min-height: 24px;
  font-weight: normal;
  margin: 10px 0 -12px 0;
  display: block;
  color: #ee0000;
  opacity: ${props => (props.visible ? '1' : '0')};
  transition: opacity ease-out 0.2s;
`;

export const FieldWrapper = styled.div`
  padding: 20px;
  position: relative;
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
  padding-left: 10px;
  display: block;
  box-sizing: border-box;

  &[type='text'],
  &[type='password'] {
    font-size: 14px;
    border-radius: 4px;
    background-color: #ffffff;
    padding: ${props => (props.isError ? '0 0 0 10px' : '1px 1px 1px 11px')};
    border: solid
      ${props => (props.isError ? '2px #ee0000' : '1px rgba(50, 54, 58, 0.15)')};
    transition: border-color ease-out 0.2s;
    width: 99.5%;
    height: 36px;
    margin-top: 10px;
  }

  &[type='text']::placeholder,
  &[type='password']::placeholder {
    font-style: italic;
    color: #32363b;
    opacity: 0.5;
  }

  &[type='checkbox'] {
    margin-left: 0;
    margin-right: 10px;
  }
`;

export const InputWrapper = styled.div`
  display: block;
  box-sizing: border-box;
  position: relative;
`;

export const InputErrorIcon = styled.span`
  display: block;
  font-family: SAP-Icons;
  color: #ee0000;
  position: absolute;
  right: 10px;
  top: 10px;
  opacity: ${props => (props.visible ? '1.0' : '0')}
  transition: opacity ease-out 0.2s;
`;

export const Select = styled.select`
  margin-top: 10px;
  font-size: 14px;
  width: 100%;
  height: 36px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.4);
  border: solid 1px rgba(50, 54, 58, 0.15);
  outline: none;
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

const Required = styled.span`
  padding-left: 3px;
  color: #ee0000;
`;

export const InputComponent = ({
  labelName,
  placeholder,
  value,
  handleChange,
  name,
  required,
  errorMessage = '',
  onBlur,
  type,
}) => (
  <FieldWrapper>
    <Label>
      {labelName}
      {required ? <Required>*</Required> : ''}
    </Label>
    <InputWrapper>
      <Input
        type={type ? type : 'text'}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        name={name}
        onBlur={onBlur}
        isError={errorMessage}
      />
      <InputErrorIcon visible={errorMessage}>{'\uE0B1'}</InputErrorIcon>
    </InputWrapper>
    <FieldErrorMessage visible={errorMessage}>{errorMessage}</FieldErrorMessage>
  </FieldWrapper>
);

export const CheckboxComponent = ({ labelName, handleCheckbox }) => (
  <CheckboxWrapper>
    <Label>
      <Input type="checkbox" onClick={() => handleCheckbox()} />
      {labelName}
    </Label>
  </CheckboxWrapper>
);

export const SelectComponent = ({
  labelName,
  handleChange,
  name,
  mappedItems,
  current,
  required,
}) => (
  <FieldWrapper>
    <Label>
      {labelName}
      {required ? <Required>*</Required> : ''}
    </Label>
    <Select onChange={handleChange} name={name} value={current}>
      {mappedItems}
    </Select>
  </FieldWrapper>
);

export const HiddenSubmitButton = styled.button`
  display: none;
`;
