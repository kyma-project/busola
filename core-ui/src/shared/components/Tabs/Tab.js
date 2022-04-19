import React from 'react';
import PropTypes from 'prop-types';
import './Tab.scss';

export const Tab = ({ status, title, onClick, tabIndex, id, isActive }) => {
  return (
    <li
      role="tab"
      className="fd-tabs__item"
      key={tabIndex}
      aria-controls={'tab' + tabIndex}
      aria-selected={isActive}
      onClick={event => {
        event.preventDefault();
        onClick(tabIndex);
      }}
    >
      <a className="fd-tabs__link" href={'#tab' + tabIndex} data-e2e-id={id}>
        <span className="fd-tabs__tag">
          {title}
          {status}
        </span>
      </a>
    </li>
  );
};

Tab.propTypes = {
  title: PropTypes.any,
  onClick: PropTypes.func,
  tabIndex: PropTypes.number,
  isActive: PropTypes.bool,
  status: PropTypes.node,
};
