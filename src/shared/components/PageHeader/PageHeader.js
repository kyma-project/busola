import React from 'react';
import PropTypes from 'prop-types';
import {
  Breadcrumbs,
  BreadcrumbsItem,
  DynamicPage,
  DynamicPageHeader,
  DynamicPageTitle,
  Text,
  Title,
} from '@ui5/webcomponents-react';

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
  content,
}) => {
  return (
    <DynamicPage
      style={{
        height: '100vh',
      }}
      // style={title === 'Clusters Overview' ? { height: '50px' } : null}
      className="page-header"
      alwaysShowContentHeader
      showHideHeaderButton={false}
      headerContentPinnable={false}
      headerTitle={
        <DynamicPageTitle
          breadcrumbs={
            breadcrumbItems.length ? (
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
            ) : null
          }
          header={<Title className="ui5-title">{title}</Title>}
          actions={actions}
        />
      }
      headerContent={
        <DynamicPageHeader className="header-wrapper">
          {description && <Text className="description">{description}</Text>}
          <section className={`column-wrapper ${columnWrapperClassName || ''}`}>
            {children}
          </section>
        </DynamicPageHeader>
      }
    >
      {content}
    </DynamicPage>
  );
};
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
