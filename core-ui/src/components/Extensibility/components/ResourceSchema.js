import React from 'react';
import { isEmpty } from 'lodash';
import * as jp from 'jsonpath';

import { ResourceForm } from 'shared/ResourceForm';
import { KeyValueField } from 'shared/ResourceForm/fields';
import * as Inputs from 'shared/ResourceForm/inputs';

const JSONSchemaForm = ({ properties, path, ...props }) => {
  const { resource, setResource } = props;

  const getValue = path => {
    return jp.value(resource, '$.' + path);
  };

  const keys = Object.keys(properties);
  return keys?.map(key => {
    const newPath = path ? `${path}.${key}` : key;
    if (properties[key].type === 'object') {
      if (!isEmpty(properties[key].properties)) {
        return (
          <ResourceForm.CollapsibleSection simple title={key}>
            <JSONSchemaForm
              properties={properties[key].properties}
              path={newPath}
              {...props}
            />
          </ResourceForm.CollapsibleSection>
        );
      } else if (properties[key].additionalProperties) {
        return (
          <KeyValueField
            value={getValue(newPath)}
            setValue={value => setResource(newPath, value)}
            title={key}
          />
        );
      } else {
        return <div>{key} - Monaco editor here?</div>;
      }
    } else if (properties[key].type === 'string') {
      if (properties[key].enum?.length) {
        const options = properties[key].enum.map(e => ({
          key: e,
          text: e,
        }));
        return (
          <ResourceForm.FormField
            options={options}
            value={getValue(newPath)}
            setValue={value => setResource(newPath, value)}
            label={key}
            input={Inputs.Dropdown}
          />
        );
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
};

export const ResourceSchema = ({ ...props }) => {
  return <JSONSchemaForm properties={props.schema.properties} {...props} />;
};
