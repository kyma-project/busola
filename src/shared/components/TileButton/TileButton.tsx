import React, { ReactNode } from 'react';
import classNames from 'classnames';
import { Text } from '@ui5/webcomponents-react';

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
          <Text>{title}</Text>
          <Text className="bsl-has-color-status-4">{description}</Text>
        </div>
      </button>
    </li>
  );
}
