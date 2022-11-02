import React, { ReactNode } from 'react';
import classNames from 'classnames';

import './TileButton.scss';

type TileButtonProps = {
  title: string;
  description: string;
  icon: ReactNode;
  isActive: boolean;
  handleClick: React.MouseEventHandler;
};

export function TileButton({
  title,
  description,
  icon,
  isActive,
  handleClick,
}: TileButtonProps) {
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
