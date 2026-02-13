import { ReactNode } from 'react';
import { ListItemCustom, Text } from '@ui5/webcomponents-react';

type TileButtonProps = {
  title: string;
  description: string;
  icon: ReactNode;
  isActive: boolean;
  onActivate: () => void;
};

export function TileButton({
  title,
  description,
  icon,
  isActive,
  onActivate: handleActivate,
}: TileButtonProps) {
  return (
    <ListItemCustom
      selected={isActive}
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          handleActivate();
        }
      }}
    >
      <div className="theme-tile">
        <div className="icon-container">{icon}</div>
        <div className="theme-tile__text">
          <Text>{title}</Text>
          <Text className="bsl-has-color-status-4">{description}</Text>
        </div>
      </div>
    </ListItemCustom>
  );
}
