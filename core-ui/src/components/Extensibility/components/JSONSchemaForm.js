import React from 'react';
import { isEmpty } from 'lodash';
import * as jp from 'jsonpath';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import './JSONSchemaForm.scss';

const RJSF = ({ properties, path, ...props }) => {
  const { resource, setResource } = props;

  const getValue = path => {
    return jp.value(resource, '$.' + path);
  };

  const keys = Object.keys(properties);
  const sections = keys?.map(key => {
    const newPath = path ? `${path}.${key}` : key;
    if (properties[key].type === 'object') {
      if (!isEmpty(properties[key].properties)) {
        return (
          <ResourceForm.CollapsibleSection simple title={key}>
            <RJSF
              properties={properties[key].properties}
              path={newPath}
              {...props}
            />
          </ResourceForm.CollapsibleSection>
        );
      } else {
        return <div>{key} - Monaco editor here?</div>;
      }
    } else if (properties[key].type === 'string') {
      console.log(properties[key].enum);
      if (properties[key].enum?.length) {
        return <div>{key} - Dropdown here</div>;
      } else {
        return (
          <ResourceForm.FormField
            value={getValue(newPath)}
            setValue={value => setResource(newPath, value)}
            label={key}
            input={Inputs.Text}
          />
        );
      }
    } else {
      return <div>{key} - default</div>;
    }
  });
  return <>{sections}</>;
};

export const JsonSchemaForm = ({ ...props }) => {
  return <RJSF properties={props.schema.properties} {...props} />;
};
