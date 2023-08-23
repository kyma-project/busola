import React from 'react';
import PropTypes from 'prop-types';
import { Breadcrumbs, BreadcrumbsItem } from '@ui5/webcomponents-react';
import { LayoutPanel } from 'fundamental-react';

import './PageHeader.scss';

const Column = ({ title, children, columnSpan, image, style = {} }) => {
  const styleComputed = { gridColumn: columnSpan, ...style };
  return (
    <div className="page-header__column" style={styleComputed}>
      {image && <div className="image">{image}</div>}
      <div className="content-container">
        <div className="title fd-has-color-status-4 ">{title}</div>
        <span className="content fd-has-color-text-1">{children}</span>
      </div>
    </div>
  );
};

export const PageHeader = ({
  title,
  description,
  breadcrumbItems,
  actions,
  children,
  columnWrapperClassName,
}) => (
  <LayoutPanel className="page-header">
    <LayoutPanel.Header>
      <section className="header-wrapper">
        {breadcrumbItems.length ? (
          <section>
            <Breadcrumbs design="NoCurrentPage">
              {breadcrumbItems.map(item => {
                return (
                  <BreadcrumbsItem
                    aria-label="breadcrumb-item"
                    key={item.name}
                    href={item.url}
                  >
                    {item.name}
                  </BreadcrumbsItem>
                );
              })}
            </Breadcrumbs>
          </section>
        ) : null}

        {title !== 'Clusters Overview' ? (
          <LayoutPanel.Head title={title} aria-label="title" />
        ) : null}
        {/* don't use Panel.Head's description, as it accepts only strings */}
        {description && <p className="description">{description}</p>}
        <section className={`column-wrapper ${columnWrapperClassName || ''}`}>
          {' '}
          {children}
        </section>
      </section>

      {actions && (
        <LayoutPanel.Actions className="fd-margin-begin--sm">
          {actions}
        </LayoutPanel.Actions>
      )}
    </LayoutPanel.Header>
  </LayoutPanel>
);
PageHeader.Column = Column;

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
  breadcrumbItems: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      path: PropTypes.string,
      params: PropTypes.object,
      fromContext: PropTypes.string,
      fromAbsolutePath: PropTypes.bool,
      onClick: PropTypes.func,
    }),
  ),
};

PageHeader.defaultProps = {
  breadcrumbItems: [],
  description: '',
};
