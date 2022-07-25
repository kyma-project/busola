import React from 'react';

import PropTypes from 'prop-types';
import classNames from 'classnames';

import './TileButton.scss';

TileButton.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  icon: PropTypes.node.isRequired,
  isActive: PropTypes.bool,
  handleClick: PropTypes.func.isRequired,
};

export function TileButton({
  title,
  description,
  icon,
  isActive,
  handleClick,
}) {
  const className = classNames('tile-button', { 'tile--active': isActive });
  return (
    <li className={className}>
      <button onClick={handleClick}>
        {icon}
        <div className="tile-button__text">
          <p>{title}</p>
          <p className="fd-has-color-status-4">{description}</p>
        </div>
      </button>
    </li>
  );
}
