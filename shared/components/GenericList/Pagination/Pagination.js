import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'fundamental-react';
import './Pagination.scss';
import classNames from 'classnames';

const Link = ({ children, isInteractable, isCurrent, onClick, ...props }) => {
  const className = classNames('nav-link', {
    current: isCurrent,
    interactable: isInteractable,
  });

  return (
    <button
      disabled={!isInteractable}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export const Pagination = ({
  itemsTotal,
  itemsPerPage,
  currentPage,
  onChangePage,
}) => {
  const pagesCount = Math.ceil(itemsTotal / itemsPerPage);

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <span className="fd-has-color-text-2">{itemsTotal} items</span>

      <Link
        isInteractable={currentPage !== 1}
        onClick={() => onChangePage(currentPage - 1)}
        aria-label="Previous page"
      >
        <Icon glyph="navigation-left-arrow" ariaLabel="Previous page" />
      </Link>

      {[...Array(pagesCount)].map((_, i) => (
        <Link
          key={i}
          isInteractable={i + 1 !== currentPage}
          isCurrent={i + 1 === currentPage}
          onClick={() => onChangePage(i + 1)}
        >
          {i + 1}
        </Link>
      ))}

      <Link
        isInteractable={currentPage !== pagesCount}
        onClick={() => onChangePage(currentPage + 1)}
        aria-label="Next page"
      >
        <Icon glyph="navigation-right-arrow" ariaLabel="next page" />
      </Link>
    </div>
  );
};

Pagination.propTypes = {
  itemsTotal: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number,
  currentPage: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
};

Pagination.defaultProps = {
  itemsPerPage: 20,
};
