import { useTranslation } from 'react-i18next';
import { spacing } from '@ui5/webcomponents-react-base';
import PropTypes from 'prop-types';
import { Button, Text, Icon } from '@ui5/webcomponents-react';
import classNames from 'classnames';
import { Select, Option } from '@ui5/webcomponents-react';
import { AVAILABLE_PAGE_SIZES } from 'state/preferences/pageSizeAtom';
import './Pagination.scss';

const makePartitions = (currentPage, pagesCount) => {
  const radius = 2;
  const partitions = [];
  // add the current page and the pages in its radius
  for (let i = 1; i <= pagesCount; i++) {
    if (i === 1 || Math.abs(currentPage - i) <= radius || i === pagesCount) {
      partitions.push(i);
    }
  }
  // if between the radius and first/last elements are further pages insert placeholders
  if (partitions[1] !== 2) {
    partitions.splice(1, 0, '...');
  }
  if (partitions[partitions.length - 2] !== pagesCount - 1) {
    partitions.splice(partitions.length - 1, 0, '...');
  }
  return partitions;
};

const Link = ({ children, isInteractable, isCurrent, onClick, ...props }) => {
  const className = classNames('nav-link', {
    current: isCurrent,
    interactable: isInteractable,
  });

  return (
    <Button
      disabled={!isInteractable}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </Button>
  );
};

export const Pagination = ({
  itemsTotal,
  itemsPerPage,
  currentPage,
  onChangePage,
  setLocalPageSize,
}) => {
  const { t } = useTranslation();
  const pagesCount = Math.ceil(itemsTotal / itemsPerPage);

  const partitions = makePartitions(currentPage, pagesCount);

  const onChange = event => {
    const selectedSize = event.detail.selectedOption.value;
    setLocalPageSize(parseInt(selectedSize));
  };

  return (
    <div className="pagination">
      <div className="pagesize-selector-container">
        <Text className="pagesize-label bsl-has-color-status-4">
          {t('settings.other.results-per-page') + ':'}
        </Text>
        <Select onChange={onChange} className="pagesize-selector">
          {AVAILABLE_PAGE_SIZES.map(available_size => (
            <Option
              value={available_size.toString()}
              key={available_size}
              selected={itemsPerPage === Number(available_size)}
            >
              {available_size}
            </Option>
          ))}
          <Option
            value={Number.MAX_SAFE_INTEGER.toString()}
            key={Number.MAX_SAFE_INTEGER}
            selected={itemsPerPage === Number.MAX_SAFE_INTEGER}
          >
            {t('settings.other.all')}
          </Option>
        </Select>
      </div>

      <div className="page-links-container" style={spacing.sapUiSmallMarginEnd}>
        <Link
          id="first-page-link"
          isInteractable={currentPage !== 1}
          onClick={() => onChangePage(1)}
          aria-label="First page"
        >
          <Icon
            aria-label="first page icon"
            name="close-command-field"
            design="Information"
          />
        </Link>
        <Link
          isInteractable={currentPage !== 1}
          onClick={() => onChangePage(currentPage - 1)}
          aria-label="Previous page"
        >
          <Icon
            aria-label="previous page icon"
            name="navigation-left-arrow"
            design="Information"
          />
        </Link>
        {partitions.map((current, i) => (
          <Link
            key={i}
            isInteractable={current !== currentPage && current !== '...'}
            isCurrent={current === currentPage}
            onClick={() => onChangePage(current)}
          >
            {current}
          </Link>
        ))}
        <Link
          isInteractable={currentPage !== pagesCount}
          onClick={() => onChangePage(currentPage + 1)}
          aria-label="Next page"
        >
          <Icon
            aria-label="next page icon"
            name="navigation-right-arrow"
            design="Information"
          />
        </Link>
        <Link
          id="last-page-link"
          isInteractable={currentPage !== pagesCount}
          onClick={() => onChangePage(pagesCount)}
          aria-label="Last page"
        >
          <Icon
            aria-label="last page icon"
            name="open-command-field"
            design="Information"
          />
        </Link>
      </div>

      <div className="items-number">
        <span className="bsl-has-color-status-4">{itemsTotal} items</span>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  itemsTotal: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number,
  currentPage: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  setLocalPageSize: PropTypes.func.isRequired,
};
