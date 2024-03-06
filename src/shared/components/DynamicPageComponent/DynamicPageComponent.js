import PropTypes from 'prop-types';
import {
  Breadcrumbs,
  BreadcrumbsItem,
  Button,
  DynamicPage,
  DynamicPageHeader,
  DynamicPageTitle,
  FlexBox,
  ObjectPage,
  ObjectPageSection,
  Title,
} from '@ui5/webcomponents-react';

import './DynamicPageComponent.scss';
import { spacing } from '@ui5/webcomponents-react-base';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { useFeature } from 'hooks/useFeature';
import { HintButton } from '../DescriptionHint/DescriptionHint';

const Column = ({ title, children, columnSpan, image, style = {} }) => {
  const styleComputed = { gridColumn: columnSpan, ...style };
  return (
    <div className="page-header__column" style={styleComputed}>
      {image && <div className="image">{image}</div>}
      <div className="content-container">
        <div className="title bsl-has-color-status-4 ">{title}:</div>
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
  footer,
  layoutNumber,
  layoutCloseUrl,
  inlineEditForm,
  showYamlTab,
  protectedResource,
  protectedResourceWarning,
}) => {
  const [showTitleDescription, setShowTitleDescription] = useState(false);
  const [layoutColumn, setLayoutColumn] = useRecoilState(columnLayoutState);
  const { isEnabled: isColumnLeyoutEnabled } = useFeature('COLUMN_LAYOUT');
  const { t } = useTranslation();

  const headerTitle = (
    <DynamicPageTitle
      navigationActions={
        (window.location.search.includes('layout') && isColumnLeyoutEnabled) ||
        (!window.location.search.includes('layout') &&
          layoutColumn?.showCreate?.resourceType) ? (
          layoutColumn.layout !== 'OneColumn' ? (
            layoutNumber !== 'StartColumn' ? (
              <>
                {layoutColumn.layout === 'TwoColumnsMidExpanded' ||
                ((layoutColumn.layout === 'ThreeColumnsMidExpanded' ||
                  layoutColumn.layout === 'ThreeColumnsEndExpanded') &&
                  layoutNumber !== 'MidColumn') ? (
                  <Button
                    aria-label="full-screen"
                    design="Transparent"
                    icon="full-screen"
                    onClick={() => {
                      const newLayout =
                        layoutNumber === 'MidColumn'
                          ? 'MidColumnFullScreen'
                          : 'EndColumnFullScreen';
                      setLayoutColumn({
                        ...layoutColumn,
                        layout: newLayout,
                      });
                      window.history.pushState(
                        window.history.state,
                        '',
                        `${window.location.pathname}${
                          layoutColumn?.showCreate?.resourceType
                            ? ''
                            : '?layout=' + newLayout
                        }`,
                      );
                    }}
                  />
                ) : null}
                {layoutColumn.layout === 'MidColumnFullScreen' ||
                layoutColumn.layout === 'EndColumnFullScreen' ? (
                  <Button
                    aria-label="close-full-screen"
                    design="Transparent"
                    icon="exit-full-screen"
                    onClick={() => {
                      const newLayout =
                        layoutNumber === 'MidColumn'
                          ? layoutColumn.endColumn === null
                            ? 'TwoColumnsMidExpanded'
                            : 'ThreeColumnsMidExpanded'
                          : 'ThreeColumnsEndExpanded';
                      setLayoutColumn({
                        ...layoutColumn,
                        layout: newLayout,
                      });
                      window.history.pushState(
                        window.history.state,
                        '',
                        `${window.location.pathname}${
                          layoutColumn?.showCreate?.resourceType
                            ? ''
                            : '?layout=' + newLayout
                        }`,
                      );
                    }}
                  />
                ) : null}
                <Button
                  aria-label="close-column"
                  design="Transparent"
                  icon="decline"
                  onClick={() => {
                    window.history.pushState(
                      window.history.state,
                      '',
                      layoutCloseUrl
                        ? layoutCloseUrl
                        : `${window.location.pathname.slice(
                            0,
                            window.location.pathname.lastIndexOf('/'),
                          )}${
                            layoutNumber === 'MidColumn' ||
                            layoutColumn?.showCreate?.resourceType
                              ? ''
                              : '?layout=TwoColumnsMidExpanded'
                          }`,
                    );
                    layoutNumber === 'MidColumn'
                      ? setLayoutColumn({
                          ...layoutColumn,
                          midColumn: null,
                          layout: 'OneColumn',
                        })
                      : setLayoutColumn({
                          ...layoutColumn,
                          endColumn: null,
                          layout: 'TwoColumnsMidExpanded',
                        });
                  }}
                />
              </>
            ) : null
          ) : null
        ) : null
      }
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
      header={
        <Title className="ui5-title">
          <FlexBox alignItems="Center">
            {title}
            {protectedResource && (
              <span style={spacing.sapUiTinyMarginBegin}>
                {protectedResourceWarning}
              </span>
            )}
            {description && (
              <HintButton
                style={spacing.sapUiTinyMargin}
                setShowTitleDescription={setShowTitleDescription}
                showTitleDescription={showTitleDescription}
                description={description}
                context="dynamic"
              />
            )}
          </FlexBox>
        </Title>
      }
      actions={actions}
    />
  );

  const headerContent =
    title !== 'Clusters Overview' && children ? (
      <DynamicPageHeader className="header-wrapper">
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
          titleText={t('common.tabs.view')}
        >
          {content}
        </ObjectPageSection>

        <ObjectPageSection
          aria-label="Edit"
          hideTitleText
          id="edit"
          titleText={
            showYamlTab ? t('common.tabs.yaml') : t('common.tabs.edit')
          }
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
      backgroundDesign="Transparent"
      headerTitle={headerTitle}
      headerContent={headerContent}
      footer={footer}
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
