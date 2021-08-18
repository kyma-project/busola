import { Icon } from 'fundamental-react';
import React from 'react';
import './CollapsibleSection.scss';

export function CollapsibleSection({ defaultOpen, title, actions, children }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const actionsRef = React.useRef();
  const iconGlyph = open ? 'navigation-down-arrow' : 'navigation-right-arrow';

  const toggle = e => {
    // ignore events from actions
    if (!actionsRef.current?.contains(e.target)) setOpen(!open);
  };

  return (
    <div className="create-modal__collapsible-section">
      <header onClick={toggle}>
        <div>
          <Icon ariaHidden glyph={iconGlyph} />
          {title}
        </div>
        <div ref={actionsRef}>{actions}</div>
      </header>
      {open && <div className="content">{children}</div>}
    </div>
  );
}
