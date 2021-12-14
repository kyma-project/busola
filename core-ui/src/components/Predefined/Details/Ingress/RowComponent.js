import React from 'react';
import { FormItem, FormLabel } from 'fundamental-react';
import './RowComponent.scss';

export const RowComponent = ({ name, value }) => (
  <FormItem className="item-wrapper panel-row-component fd-margin-top--tiny">
    <FormLabel className="form-label">{name}:</FormLabel>
    <div>{value}</div>
  </FormItem>
);
