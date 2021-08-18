import { Icon } from 'fundamental-react';
import React from 'react';
import './CollapsibleSection.scss';

export function CollapsibleSection({
  defaultOpen = false,
  title,
  actions,
  children,
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const actionsRef = React.useRef();

  const toggle = e => {
    // ignore events from actions
    if (actionsRef.current?.contains(e.target)) {
      return;
    }
    setOpen(!open);
  };

  return (
    <div className="create-modal__collapsible-section">
      <header onClick={toggle}>
        <div>
          <Icon
            ariaHidden
            glyph={open ? 'navigation-down-arrow' : 'navigation-right-arrow'}
          />
          {title}
        </div>
        <div ref={actionsRef}>{actions}</div>
      </header>
      {open && <div className="content">{children}</div>}
    </div>
  );
}
