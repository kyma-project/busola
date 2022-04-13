import React from 'react';
import Form from '@rjsf/core';

import './JSONSchemaForm.scss';

class FixedForm extends Form {
  constructor(props) {
    super(props);
  }

  render() {
    return <Form {...this.props} />;
  }
}

export const JsonSchemaForm = ({ ...props }) => {
  return <FixedForm {...props} />;
};
