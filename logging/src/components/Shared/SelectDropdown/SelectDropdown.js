import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './SelectDropdown.scss';

import { Popover, Menu, Button } from 'fundamental-react';

const SelectDropdownValue = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }),
]);

SelectDropdown.propTypes = {
  availableValues: PropTypes.arrayOf(SelectDropdownValue).isRequired,
  currentValue: PropTypes.string.isRequired,
  icon: PropTypes.string,
  updateValue: PropTypes.func.isRequired,
  compact: PropTypes.bool,
};

SelectDropdown.defaultProps = {
  icon: '',
  compact: false,
};

export default function SelectDropdown({
  availableValues,
  currentValue,
  icon,
  updateValue,
  compact,
}) {
  const popoverContent = (
    <Menu className="select-dropdown--list">
      <Menu.List>
        {availableValues.map(value => {
          const v = value.value ? value.value : value;
          const l = value.label ? value.label : value;
          return (
            <Menu.Item key={v} onClick={() => updateValue(v)}>
              <span
                className={classNames('caption-muted', {
                  'fd-has-font-weight-bold': v === currentValue,
                })}
              >
                {l}
              </span>
            </Menu.Item>
          );
        })}
      </Menu.List>
    </Menu>
  );

  const currentLabel = availableValues
    .filter(value => value === currentValue || value.value === currentValue)
    .map(value => (value.label ? value.label : value))[0];

  return (
    <span className="link-button fd-has-type-minus-1 select-dropdown">
      <Popover
        body={popoverContent}
        control={
          <Button
            glyph={icon}
            option="transparent"
            className="fd-margin-end--tiny"
            size="xs"
          >
            {!compact && currentLabel}
          </Button>
        }
        placement={compact ? 'bottom-end' : 'bottom-start'}
      />
    </span>
  );
}
