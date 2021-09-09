import { Icon } from 'fundamental-react';
import React from 'react';
import './CollapsibleSection.scss';
import * as jp from 'jsonpath';

export function CollapsibleSection({
  disabled = false,
  defaultOpen,
  title,
  actions,
  children,
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const actionsRef = React.useRef();
  const iconGlyph = open ? 'navigation-down-arrow' : 'navigation-right-arrow';

  const toggle = e => {
    // ignore events from actions
    if (disabled) return;
    if (!actionsRef.current?.contains(e.target)) setOpen(!open);
  };

  return (
    <div className="create-modal__collapsible-section">
      <header onClick={toggle}>
        <div>
          {!disabled && <Icon ariaHidden glyph={iconGlyph} />}
          {title}
        </div>
        <div ref={actionsRef}>{actions}</div>
      </header>
      {open && <div className="content">{children}</div>}
    </div>
  );
}

export function CollapsibleSection2({
  disabled = false,
  defaultOpen,
  canChangeState = true,
  title,
  actions,
  children,
  resource,
  setResource,
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const actionsRef = React.useRef();
  const iconGlyph = open ? 'navigation-down-arrow' : 'navigation-right-arrow';

  const toggle = e => {
    // ignore events from actions
    if (!canChangeState) return;
    if (disabled) return;
    if (!actionsRef.current?.contains(e.target)) setOpen(!open);
  };

  return (
    <div className="create-modal__collapsible-section">
      <header onClick={toggle}>
        <div>
          {!disabled && canChangeState && (
            <Icon className="control-icon" ariaHidden glyph={iconGlyph} />
          )}
          {title}
        </div>
        <div ref={actionsRef}>{actions}</div>
      </header>
      {open && (
        <div className="content">
          {React.Children.map(children, child => {
            if (!child.props.propertyPath) {
              return child;
            }
            return React.cloneElement(child, {
              value: jp.value(resource, child.props.propertyPath),
              setValue: value => {
                jp.value(resource, child.props.propertyPath, value);
                setResource({ ...resource });
              },
            });
          })}
        </div>
      )}
    </div>
  );
}
