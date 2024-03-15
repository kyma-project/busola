import { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import { spacing } from '@ui5/webcomponents-react-base';

import { Title } from './Title';
import { ResourceFormWrapper } from './Wrapper';

import './CollapsibleSection.scss';

export function CollapsibleSection({
  disabled = false,
  defaultOpen = undefined,
  canChangeState = true,
  title,
  actions,
  children,
  resource,
  setResource,
  className,
  required,
  tooltipContent,
  nestingLevel = 0,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const actionsRef = useRef();
  const iconGlyph = open ? 'navigation-down-arrow' : 'navigation-right-arrow';
  required = required === true;

  useEffect(() => {
    if (defaultOpen !== undefined) {
      setOpen(defaultOpen);
    }
  }, [defaultOpen]);

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
      required: required,
      disabled,
    },
  );

  return (
    <div className={classNames}>
      <header
        onClick={toggle}
        aria-label={`expand ${title}`}
        style={{
          marginRight: '-1rem',
          marginLeft: `-1rem`,
          paddingLeft: `calc(${nestingLevel + 1} * ${
            spacing.sapUiSmallMarginBegin.marginLeft
          })`,
        }}
        className="header"
      >
        <Title
          tooltipContent={tooltipContent}
          title={title}
          disabled={disabled}
          canChangeState={canChangeState}
          iconGlyph={iconGlyph}
          required={required}
        />

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
          nestingLevel={nestingLevel + 1}
          required={required}
        >
          {children}
        </ResourceFormWrapper>
      </div>
    </div>
  );
}
