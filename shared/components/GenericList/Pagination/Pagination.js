import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'fundamental-react';
import './Pagination.scss';
import classNames from 'classnames';

const makePartitions = (currentPage, pagesCount) => {
  const radius = 2;
  return new Array(pagesCount)
    .fill(0)
    .map((_, i) => i)
    .filter(
      i =>
        i < radius ||
        i > pagesCount - radius - 1 ||
        Math.abs(i - currentPage + 1) <= radius / 2,
    );
};

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

  const partitions = makePartitions(currentPage, pagesCount);

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <span className="fd-has-color-status-4">{itemsTotal} items</span>

      <Link
        isInteractable={currentPage !== 1}
        onClick={() => onChangePage(currentPage - 1)}
        aria-label="Previous page"
      >
        <Icon ariaLabel="previous page icon" glyph="navigation-left-arrow" />
      </Link>

      {partitions.map((current, i) => (
        <React.Fragment key={i}>
          {i > 0 && current - partitions[i - 1] > 1 && '...'}
          <Link
            isInteractable={current + 1 !== currentPage}
            isCurrent={current + 1 === currentPage}
            onClick={() => onChangePage(current + 1)}
          >
            {current + 1}
          </Link>
        </React.Fragment>
      ))}

      <Link
        isInteractable={currentPage !== pagesCount}
        onClick={() => onChangePage(currentPage + 1)}
        aria-label="Next page"
      >
        <Icon ariaLabel="next page icon" glyph="navigation-right-arrow" />
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
