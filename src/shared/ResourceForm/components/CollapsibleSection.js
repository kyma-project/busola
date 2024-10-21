import { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import { ResourceFormWrapper } from './Wrapper';
import { Panel, Toolbar, ToolbarSpacer } from '@ui5/webcomponents-react';
import { Title } from './Title';
import './CollapsibleSection.scss';

export function CollapsibleSection({
  disabled = false,
  defaultOpen = undefined,
  canChangeState = true,
  title,
  defaultTitleType = false,
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
  required = required === true;

  useEffect(() => {
    if (defaultOpen !== undefined) {
      setOpen(defaultOpen);
    }
  }, [defaultOpen]);

  const toggle = e => {
    e.stopPropagation();
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

  const titleText =
    typeof title === 'string'
      ? title
      : Array.isArray(title?.props?.children)
      ? title?.props?.children.join()
      : title?.props?.children;

  return (
    <Panel
      accessibleRole="Form"
      collapsed={!open}
      noAnimation
      className={classNames}
      onToggle={toggle}
      data-testid={titleText?.toLowerCase().replaceAll(' ', '-')}
      accessibleName={titleText}
      ref={panelElement => {
        if (panelElement) {
          panelElement.useAccessibleNameForToggleButton = true;
        }
      }}
      header={
        <Toolbar
          tabIndex={-1}
          active={!disabled}
          toolbarStyle="Clear"
          onClick={toggle}
          aria-label={`${title}, ${open ? 'expanded' : 'collapsed'}`}
        >
          {!defaultTitleType && (
            <Title
              tooltipContent={tooltipContent}
              title={title}
              disabled={disabled}
              canChangeState={canChangeState}
              required={required}
            />
          )}
          {defaultTitleType && title}
          {actions && (
            <>
              <ToolbarSpacer />
              <div className="actions" ref={actionsRef}>
                {typeof actions === 'function' ? actions(setOpen) : actions}
              </div>
            </>
          )}
        </Toolbar>
      }
    >
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
    </Panel>
  );
}
