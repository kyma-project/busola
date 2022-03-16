import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { LayoutPanel, Button } from 'fundamental-react';
import './CollapsiblePanel.scss';

export const CollapsiblePanel = ({
  children,
  title,
  className,
  actions,
  isOpenInitially = true,
}) => {
  const [isOpen, setIsOpen] = useState(isOpenInitially);

  const switchOpen = e => {
    e.stopPropagation();
    // ensure event didn't come from DOM propagation
    if (e.target === e.currentTarget) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <LayoutPanel className={classNames('collapsible-panel', className)}>
      <LayoutPanel.Header onClick={switchOpen}>
        <h3 className="fd-panel__title" onClick={switchOpen}>
          {title}
        </h3>
        <LayoutPanel.Actions>
          {actions}
          <Button
            glyph={isOpen ? 'navigation-up-arrow' : 'navigation-down-arrow'}
            option="transparent"
            onClick={switchOpen}
          />
        </LayoutPanel.Actions>
      </LayoutPanel.Header>
      <LayoutPanel.Body
        className={isOpen ? 'body body--open' : 'body body--closed'}
      >
        {children}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};

CollapsiblePanel.propTypes = {
  children: PropTypes.element.isRequired,
  title: PropTypes.string.isRequired,
  className: PropTypes.string,
  actions: PropTypes.element,
  isOpenInitially: PropTypes.bool,
};
