import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';

import { Title } from './Title';
import { ResourceFormWrapper } from './Wrapper';

import './CollapsibleSection.scss';

export function CollapsibleSection({
  disabled = false,
  defaultOpen = undefined,
  isAdvanced,
  canChangeState = true,
  title,
  actions,
  children,
  resource,
  setResource,
  className,
  required,
  tooltipContent,
  lvl = 0,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const actionsRef = useRef();
  const iconGlyph = open ? 'navigation-down-arrow' : 'navigation-right-arrow';

  useEffect(() => setOpen(defaultOpen), [defaultOpen]);

  const toggle = e => {
    // ignore events from actions
    if (!canChangeState) return;
    if (disabled) return;
    if (!actionsRef.current?.contains(e.target)) setOpen(!open);
  };

  const classNames = classnames(
    'resource-form__collapsible-section',
    className,
    {
      collapsed: !open,
      required,
      disabled,
    },
  );

  return (
    <div className={classNames}>
      <header
        onClick={toggle}
        aria-label={`expand ${title}`}
        style={{ marginLeft: `${lvl * 16}px` }}
      >
        {
          <Title
            tooltipContent={tooltipContent}
            title={title}
            disabled={disabled}
            canChangeState={canChangeState}
            iconGlyph={iconGlyph}
          />
        }
        <div className="actions" ref={actionsRef}>
          {typeof actions === 'function' ? actions(setOpen) : actions}
        </div>
      </header>

      <div
        className={open ? 'content content--open' : 'content content--closed'}
      >
        <ResourceFormWrapper
          resource={resource}
          setResource={setResource}
          isAdvanced={isAdvanced}
        >
          {children}
        </ResourceFormWrapper>
      </div>
    </div>
  );
}
