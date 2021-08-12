import React from 'react';

import classNames from 'classnames';

import './TileButton.scss';

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
        <div>
          <p>{title}</p>
          <p className="fd-has-color-status-4">{description}</p>
        </div>
      </button>
    </li>
  );
}
