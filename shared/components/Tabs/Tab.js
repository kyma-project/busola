import React from 'react';
import PropTypes from 'prop-types';
import './Tab.scss';

export const Tab = ({ status, title, onClick, tabIndex, id, isActive }) => {
  return (
    <li
      role="tab"
      class="fd-tabs__item"
      key={tabIndex}
      aria-controls={'tab' + tabIndex}
    >
      <a
        class="fd-tabs__link"
        href={'#tab' + tabIndex}
        onClick={event => {
          event.preventDefault();
          onClick(tabIndex);
        }}
        aria-selected={isActive}
        role="tab"
        data-e2e-id={id}
      >
        <span class="fd-tabs__tag">
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
