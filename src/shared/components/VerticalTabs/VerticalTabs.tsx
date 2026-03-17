import { ReactElement, ReactNode } from 'react';
import { List } from '@ui5/webcomponents-react';
import { TileButton } from 'shared/components/TileButton/TileButton';

import './VerticalTabs.scss';

interface VerticalTabsProps {
  tabs: {
    id: number;
    title: string;
    description?: string;
    icon: ReactNode;
    onActivate?: () => void;
  }[];
  children: ReactNode | ReactNode[];
  tabId: number;
  onSetTabId: (id: number) => void;
}

export function VerticalTabs({
  tabs,
  children,
  tabId,
  onSetTabId: handleSetTabId,
}: VerticalTabsProps) {
  const handleActivateTabWithId = (id: number, onActivate?: () => void) => {
    handleSetTabId(id);
    if (onActivate) onActivate();
  };
  return (
    <section className="vertical-tabs-wrapper">
      <List>
        {tabs.map(
          ({ id, onActivate: handleActivate, description, ...props }) => (
            <TileButton
              key={id}
              description={description ?? ''}
              {...props}
              isActive={id === tabId}
              onActivate={() => handleActivateTabWithId(id, handleActivate)}
            />
          ),
        )}
      </List>
      {(children as ReactElement<{ id: number }>[]).filter(
        ({ props }) => props.id === tabId,
      )}
    </section>
  );
}
interface VerticalTabsContentProps {
  id: number;
  children: ReactNode | ReactNode[];
}

VerticalTabs.Content = ({ children }: VerticalTabsContentProps) => children;
