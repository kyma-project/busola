import React from 'react';
import styled from 'styled-components';
import Form from 'react-jsonschema-form';

const StyledForm = styled(Form)`
  padding: 20px;

  .form-group .form-group {
    margin-bottom: 20px;
  }

  label {
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
    display: block;
  }

  input {
    padding-left: 10px;
    display: block;
    box-sizing: border-box;
    margin-top: 10px;

    &[type='text'],
    &[type='password'] {
      font-size: 14px;
      border-radius: 4px;
      background-color: #ffffff;
      padding: ${props => (props.isError ? '0 0 0 10px' : '1px 1px 1px 11px')};
      border: solid
        ${props =>
          props.isError ? '2px #ee0000' : '1px rgba(50, 54, 58, 0.15)'};
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
  }

  select {
    margin-top: 10px;
    margin-top: 10px;
    font-size: 14px;
    width: 100%;
    height: 36px;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.4);
    border: solid 1px rgba(50, 54, 58, 0.15);
    outline: none;
    display: block;
  }

  select[multiple] {
    height: auto;

    option {
      padding: 7px 10px;
    }
  }

  .checkbox {
    label {
      display: block;
    }

    input {
      display: inline-block;
      margin: 0 6px 0 0;
    }
  }

  p.field-description {
    font-family: 72;
    font-size: 12px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.33;
    letter-spacing: normal;
    color: #32363b99;
    display: block;
    margin-top: 5px;
    margin-bottom: 10px;
  }

  .required {
    padding-left: 3px;
    color: #ee0000;
  }

  .btn-add,
  .array-item-remove,
  .array-item-move-down,
  .array-item-move-up {
    appearance: none;
    border: 0;
    box-shadow: 0;
    padding: 0;
    line-height: 1.5;
    cursor: pointer;
    outline: none;
    display: block;
    font-family: 72;
    font-size: 14px;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.21;
    letter-spacing: normal;
    text-align: center;
    font-weight: normal !important;
  }

  .btn-add,
  .array-item-move-down,
  .array-item-move-up {
    color: #0a6ed1;
  }

  .btn-add {
    margin-top: 10px;

    i:before {
      content: '+ Add';
    }
  }

  .array-item-move-up i:before {
    content: 'Move up';
  }

  .array-item-move-down i:before {
    content: 'Move down';
  }

  .array-item-remove {
    color: #ee0000;
    i:before {
      content: 'Delete';
    }
  }

  .btn-group {
    display: block;
  }

  .array-item {
    padding: 20px 0;
    border-top: 1px solid rgba(204, 204, 204, 0.3);
    border-bottom: 1px solid rgba(204, 204, 204, 0.3);
  }

  button[type='submit'] {
    display: none;
  }

  .config-error {
    width: 100%;
    font-family: '72';
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    padding: 10px 0;
    font-stretch: normal;
    line-height: 1.14;
    letter-spacing: normal;
    text-align: left;
    display: block;
    box-sizing: border-box;
  }

  pre {
    unicode-bidi: embed;
    font-family: 'Consolas', monospace;
    white-space: pre;
  }

  pre,
  .config-error {
    /*
      FIXME: Temporary solution, remove it afer resolving:
      https://github.com/mozilla-services/react-jsonschema-form/issues/963
    */
    display: none;
  }
`;

export const JsonSchemaForm = props => {
  return <StyledForm {...props} />;
};
