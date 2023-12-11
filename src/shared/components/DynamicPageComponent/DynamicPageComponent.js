import React from 'react';
import PropTypes from 'prop-types';
import {
  Breadcrumbs,
  BreadcrumbsItem,
  DynamicPage,
  DynamicPageHeader,
  DynamicPageTitle,
  ObjectPage,
  ObjectPageSection,
  Text,
  Title,
} from '@ui5/webcomponents-react';

import './DynamicPageComponent.scss';

const Column = ({ title, children, columnSpan, image, style = {} }) => {
  const styleComputed = { gridColumn: columnSpan, ...style };
  return (
    <div className="page-header__column" style={styleComputed}>
      {image && <div className="image">{image}</div>}
      <div className="content-container">
        <div className="title bsl-has-color-status-4 ">{title}</div>
        <span className="content bsl-has-color-text-1">{children}</span>
      </div>
    </div>
  );
};

export const DynamicPageComponent = ({
  title,
  description,
  breadcrumbItems,
  actions,
  children,
  columnWrapperClassName,
  content,
  inlineEditForm,
}) => {
  const headerTitle = (
    <DynamicPageTitle
      style={title === 'Clusters Overview' ? { display: 'none' } : null}
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
      header={<Title className="ui5-title"> {title}</Title>}
      actions={actions}
    />
  );

  const headerContent =
    title !== 'Clusters Overview' ? (
      <DynamicPageHeader className="header-wrapper">
        {description && <Text className="description">{description}</Text>}
        <section className={`column-wrapper ${columnWrapperClassName || ''}`}>
          {children}
        </section>
      </DynamicPageHeader>
    ) : null;

  if (inlineEditForm) {
    return (
      <ObjectPage
        mode="IconTabBar"
        className="page-header"
        alwaysShowContentHeader
        showHideHeaderButton={false}
        headerContentPinnable={false}
        headerTitle={headerTitle}
        headerContent={headerContent}
      >
        <ObjectPageSection
          aria-label="View"
          hideTitleText
          id="view"
          titleText="View"
        >
          {content}
        </ObjectPageSection>

        <ObjectPageSection
          aria-label="Edit"
          hideTitleText
          id="edit"
          titleText="Edit"
        >
          {inlineEditForm()}
        </ObjectPageSection>
      </ObjectPage>
    );
  }
  return (
    <DynamicPage
      className="page-header"
      alwaysShowContentHeader
      showHideHeaderButton={false}
      headerContentPinnable={false}
      headerTitle={headerTitle}
      headerContent={headerContent}
    >
      {content}
    </DynamicPage>
  );
};
DynamicPageComponent.Column = Column;

DynamicPageComponent.propTypes = {
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

DynamicPageComponent.defaultProps = {
  breadcrumbItems: [],
  description: '',
};
