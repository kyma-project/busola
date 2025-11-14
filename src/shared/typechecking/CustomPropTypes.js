import PropTypes from 'prop-types';

const ref = PropTypes.shape({ current: PropTypes.any });

const button = function (props, propName, componentName) {
  if (!props[propName]) return false;

  const buttonProps = new Map([
    ['compact', 'boolean'],
    ['disabled', 'boolean'],
    ['glyph', 'string'],
    ['label', 'string'],
    ['text', 'string'],
  ]);
  function hasTextOrLabel() {
    return (
      !Object.prototype.hasOwnProperty.call(props[propName], 'text') &&
      !Object.prototype.hasOwnProperty.call(props[propName], 'label') &&
      new Error(`Either "text" or "label" is required`)
    );
  }

  function checkTypes() {
    for (const [key, type] of buttonProps.entries()) {
      if (
        Object.prototype.hasOwnProperty.call(props[propName], key) &&
        typeof props[propName][key] !== type
      ) {
        return new Error(
          `Invalid prop ${propName} supplied to ${componentName}. Expected ${key} to be ${type}.`,
        );
      }
    }
  }

  const hasRequiredProps = hasTextOrLabel();
  if (hasRequiredProps) return hasRequiredProps || null;

  const hasPropsOfValidTypes = checkTypes();
  if (hasPropsOfValidTypes) return hasPropsOfValidTypes || null;

  return null;
};

const listActions = PropTypes.arrayOf(function (props, index, componentName) {
  const element = props[index];
  if (!element.name) {
    return new Error(`name is a required prop in '${componentName}'!`);
  }
  if (!element.handler && !element.component) {
    return new Error(
      `One of props 'handler' or 'component' was not specified in '${componentName}'.`,
    );
  }
});

const customColumn = PropTypes.exact({
  header: PropTypes.string,
  value: PropTypes.func.isRequired, // gets the resource item as param; should return PropTypes.node
  id: PropTypes.string,
  visibility: PropTypes.func,
});

const customColumnsType = PropTypes.arrayOf(customColumn);

const CustomPropTypes = {
  customColumnsType,
  button,
  ref,
  listActions,
};

export default CustomPropTypes;
