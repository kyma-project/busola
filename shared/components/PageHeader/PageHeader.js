import React from 'react';
import PropTypes from 'prop-types';
import { LayoutPanel, Breadcrumb } from 'fundamental-react';
import './PageHeader.scss';
import LuigiClient from '@luigi-project/client';

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
const performOnClick = item => {
  if (!item.path) {
    return null;
  }

  let linkManager = LuigiClient.linkManager();
  if (!item.fromAbsolutePath) {
    linkManager = item.fromContext
      ? linkManager.fromContext(item.fromContext)
      : linkManager.fromClosestContext();
  }

  if (!item.params) {
    return linkManager.navigate(item.path);
  }

  return linkManager.withParams(item.params).navigate(item.path);
};

export const PageHeader = ({
  title,
  description,
  breadcrumbItems,
  actions,
  isCatalog,
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
                  <Breadcrumb.Item
                    aria-label="breadcrumb-item"
                    key={item.name}
                    name={item.name}
                    url="#"
                    onClick={item.onClick || (() => performOnClick(item))}
                  />
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
        <LayoutPanel.Actions
          className={`fd-margin-begin--sm ${isCatalog ? 'is-catalog' : ''}`}
        >
          {actions}
        </LayoutPanel.Actions>
      )}
    </LayoutPanel.Header>
  </LayoutPanel>
);
PageHeader.Column = Column;

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  isCatalog: PropTypes.bool,
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
