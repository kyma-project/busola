import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import { ResourceFormWrapper } from './Wrapper';
import { Panel } from '@ui5/webcomponents-react';
import { Title } from './Title';
import './CollapsibleSection.scss';
import { Toolbar } from '@ui5/webcomponents-react-compat/dist/components/Toolbar/index.js';
import { ToolbarSpacer } from '@ui5/webcomponents-react-compat/dist/components/ToolbarSpacer/index.js';

export type CollapsibleSectionProps = {
  disabled?: boolean;
  defaultOpen?: boolean;
  canChangeState?: boolean;
  title: string | JSX.Element;
  defaultTitleType?: boolean;
  actions?:
    | React.ReactNode[]
    | JSX.Element
    | ((setOpen: Dispatch<SetStateAction<boolean | undefined>>) => JSX.Element);
  children: React.ReactNode;
  resource?: Record<string, any> | string;
  setResource?: (resource: Record<string, any> | string) => void;
  className?: string;
  required?: boolean;
  tooltipContent?: React.ReactNode;
  nestingLevel?: number;
};

export function CollapsibleSection({
  disabled = undefined,
  defaultOpen,
  canChangeState = true,
  title,
  defaultTitleType = false,
  actions = undefined,
  children,
  resource = undefined,
  setResource = undefined,
  className,
  required = undefined,
  tooltipContent = undefined,
  nestingLevel = 0,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const actionsRef = useRef<HTMLDivElement>(null);
  required = required === true;

  useEffect(() => {
    if (defaultOpen !== undefined) {
      const timeoutId = setTimeout(() => {
        setOpen(defaultOpen);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [defaultOpen]);

  const toggle = (e?: CustomEvent) => {
    e?.stopPropagation();
    if (!canChangeState || disabled) return;
    if (!actionsRef.current?.contains(e?.target as Node)) {
      setOpen(!open);
    }
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
      ref={(panelElement: any) => {
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
