import React from 'react';
import PropTypes from 'prop-types';

import { CustomPropTypes, Dropdown } from 'react-shared';
import { FormItem } from 'fundamental-react';

const ServicesDropdown = ({
  _ref,
  loading,
  data,
  error,
  defaultValue,
  serviceName,
}) => {
  if (loading) {
    return 'Loading services...';
  }

  if (error || (!loading && !data)) {
    return "Couldn't load service list " + error.message;
  }

  const services =
    serviceName && serviceName !== 'undefined'
      ? data.filter(s => s.metadata.name === serviceName)
      : data;

  const options =
    services
      ?.map(service =>
        service.spec.ports.map(port => ({
          key: `${service.metadata.name}:${port.port}`,
          text: `${service.metadata.name} (port: ${port.port})`,
        })),
      )
      .flat() || [];

  let defaultService;
  if (_ref.current) defaultService = _ref.current;
  else if (options?.length) {
    if (defaultValue?.name && defaultValue.name !== 'undefined') {
      if (defaultValue?.port && defaultValue.port !== 'undefined') {
        defaultService = `${defaultValue.name}:${defaultValue.port}`;
      } else {
        defaultService = options?.find(option =>
          option.key.includes(defaultValue.name),
        ).key;
      }
    } else {
      defaultService = options[0].key;
    }
  }
  _ref.current = defaultService;

  function onSelect(_, selected) {
    _ref.current = selected.key;
  }

  return (
    <FormItem>
      <Dropdown
        label="Service"
        id="service"
        options={options}
        onSelect={onSelect}
        selectedKey={defaultService}
        emptyListMessage="No Services in this Namespace"
      />
    </FormItem>
  );
};

ServicesDropdown.propTypes = {
  _ref: CustomPropTypes.ref,
  loading: PropTypes.bool,
  data: PropTypes.array,
  error: PropTypes.object,
  defaultValue: PropTypes.object,
  serviceName: PropTypes.string,
};

export default ServicesDropdown;
