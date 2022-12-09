import React from 'react';
import PropTypes from 'prop-types';
import { LayoutPanel, Breadcrumb } from 'fundamental-react';
import { Link } from 'react-router-dom';

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
            <Breadcrumb>
              {breadcrumbItems.map(item => {
                return (
                  <Breadcrumb.Item aria-label="breadcrumb-item" key={item.name}>
                    <Link to={item.url}>{item.name}</Link>
                  </Breadcrumb.Item>
                );
              })}
            </Breadcrumb>
          </section>
        ) : null}

        <LayoutPanel.Head title={title} aria-label="title" />
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
