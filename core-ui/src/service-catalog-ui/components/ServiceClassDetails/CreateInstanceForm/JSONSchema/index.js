import React from 'react';
import styled from 'styled-components';
import Form from 'react-jsonschema-form';

const StyledForm = styled(Form)`
  .form-group .form-group {
    margin: 0 0 16px 0;

    &:last-child {
      margin: 0;
    }
    select,
    input {
      color: var(--sapNeutralTextColor, #6a6d70);
    }
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
    color: var(--sapTextColor, #32363a);
    display: block;
  }

  input {
    padding: 0 10px;
    display: block;
    box-sizing: border-box;
    margin-top: 6px;
    outline: none;

    &[type='text'],
    &[type='password'] {
      font-size: 14px;
      border-radius: var(--sapField_BorderCornerRadius, 0.125rem);
      background-color: var(--sapGroup_ContentBackground, #fff);
      padding: ${props => (props.isError ? '0 0 0 10px' : '1px 1px 1px 11px')};
      border: solid
        ${props =>
          props.isError
            ? '2px var(--sapErrorBorderColor, #bb0000)'
            : '1px var(--sapField_BorderColor, #89919a)'};
      transition: border-color ease-out 0.2s;
      width: 100%;
      height: 36px;
      margin-top: 6px;
    }

    &[type='text']::placeholder,
    &[type='password']::placeholder {
      font-style: italic;
      color: var(--sapTextColor, #32363a);
      opacity: 0.5;
    }

    &[type='text']:hover,
    &[type='password']:hover {
      border: 1px solid #2196f3;
    }

    &[type='text']:focus,
    &[type='password']:focus {
      border: 1px solid #2196f3;
    }

    &[type='checkbox'] {
      margin-left: 0;
      margin-right: 10px;
    }
  }

  select {
    padding: 0 32px 0 10px;
    margin-top: 10px;
    margin-top: 10px;
    font-size: 14px;
    width: 100%;
    height: 36px;
    border-radius: var(--sapField_BorderCornerRadius, 0.125rem);
    background-color: var(--sapGroup_ContentBackground, #fff);
    border: solid 1px var(--sapField_BorderColor);
    outline: none;
    display: block;
    transition: border-color ease-out 0.2s;
    position: relative;
    appearance: none;
    background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzkiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzOSAzNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiNGQUZCRkMiIGQ9Ik0xIDBoMzd2MzZIMXoiLz48cGF0aCBkPSJNMSAwdjM2TTM4IDB2MzYiIHN0cm9rZT0iI0NFQ0VEMCIvPjxwYXRoIGQ9Ik0yNi45MTkgMTYuODQzbC03LjY2NyA4LjA1OGEuMzY0LjM2NCAwIDAgMS0uMjUzLjA5OS4zNjQuMzY0IDAgMCAxLS4yNTItLjFsLTcuNjY0LTguMDU3YS4yODMuMjgzIDAgMCAxIC4wMzQtLjQyOGwxLjcyMS0xLjM0MWEuMzUyLjM1MiAwIDAgMSAuMjE4LS4wNzRsLjAyNS4wMDFjLjA4OC4wMDYuMTcuMDQ1LjIyOC4xMDdMMTkgMjEuMjAybDUuNjkzLTYuMDk0Yy4xMi0uMTMuMzMtLjE0NS40Ny0uMDM0bDEuNzIyIDEuMzQxYS4yOTcuMjk3IDAgMCAxIC4xMTUuMjA3LjI4My4yODMgMCAwIDEtLjA4LjIyMXoiIGZpbGw9IiMwQTZFRDEiLz48L2c+PC9zdmc+);
    background-repeat: no-repeat;
    background-position: calc(100% + 0.0625rem) center;

    &:hover {
      border: 1px solid #2196f3;
    }

    &:focus {
      border: 1px solid #2196f3;
    }

    &::after {
      content: '';
      width: 0.625rem;
      height: 0.3125rem;
      border-color: transparent;
      border-style: solid;
      border-width: 0 0 0.125rem 0.125rem;
      -webkit-transform: rotate(-45deg);
      transform: rotate(-45deg);
      position: absolute;
      z-index: 2;
      top: calc(50% - 0.25rem);
      left: calc(50% - 0.625rem / 2);
    }
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
    color: var(--sapContent_DisabledTextColor, rgba(50, 54, 58, 0.6));
    display: block;
    margin: 6px 0 0 0;
  }

  .required {
    padding-left: 3px;
    color: var(--sapField_RequiredColor, #ce3b3b);
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
    color: var(--sapTextColor, #32363a);
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
    color: var(--sapTextColor, #32363a);
    i:before {
      content: '\uE03D';
      font-family: SAP-icons;
      font-size: 14px;
      display: inline-block;
      padding: 0 10px;
    }
  }

  .btn-group {
    display: block;
  }

  .array-item {
    padding: 16px 0;
    border-top: 1px solid rgba(204, 204, 204, 0.3);

    &:first-child {
      margin-top: 16px;
    }
    &:last-child {
      border-bottom: 1px solid rgba(204, 204, 204, 0.3);
    }
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

  i {
    display: inline-block;
    margin-top: 16px;
  }

  .panel-danger {
    display: none;
  }
  .field-object .field-string {
    div > ul.error-detail > li.text-danger {
      padding-top: 5px;
      color: var(--sapTextColor, #32363a);
    }
  }

  .field-object .field-object {
    .row {
      display: flex;
      padding-top: 10px;
      .form-additional {
        flex-grow: 1;
        padding-right: 10px;
      }
      .col-xs-2 {
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
    }
    p.field-description {
      margin-bottom: 12px;
    }
    div.form-group {
      margin-bottom: 0;
      padding: 0 0 16px 0px;
    }

    div.row div.form-group {
      border-left: none;
      padding: 0;
    }
  }
  fieldset#root_tags > div.form-group {
    border-bottom: 2px solid rgba(204, 204, 204, 0.3);
  }
  fieldset#root {
    background-color: var(--sapGroup_ContentBackground, #fff);
  }
`;

export const JsonSchemaForm = ({ schemaFormRef, ...props }) => {
  return (
    <StyledForm
      additionalMetaSchemas={[
        require('ajv/lib/refs/json-schema-draft-04.json'),
      ]}
      innerRef={schemaFormRef}
      {...props}
    />
  );
};
