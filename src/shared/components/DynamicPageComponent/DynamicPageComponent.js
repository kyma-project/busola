import PropTypes from 'prop-types';
import {
  Button,
  FlexBox,
  DynamicPage,
  DynamicPageHeader,
  DynamicPageTitle,
  Title,
  TabContainer,
  Tab,
} from '@ui5/webcomponents-react';
import { Toolbar } from '@ui5/webcomponents-react-compat/dist/components/Toolbar/index.js';
import { ToolbarSpacer } from '@ui5/webcomponents-react-compat/dist/components/ToolbarSpacer/index.js';
import { ToolbarSeparator } from '@ui5/webcomponents-react-compat/dist/components/ToolbarSeparator/index.js';

import './DynamicPageComponent.scss';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { HintButton } from '../DescriptionHint/DescriptionHint';
import { isResourceEditedState } from 'state/resourceEditedAtom';
import { isFormOpenState } from 'state/formOpenAtom';
import { handleActionIfFormOpen } from '../UnsavedMessageBox/helpers';

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
  headerContent: customHeaderContent,
  title,
  description = '',
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
  className,
}) => {
  const [showTitleDescription, setShowTitleDescription] = useState(false);
  const [layoutColumn, setLayoutColumn] = useRecoilState(columnLayoutState);
  const { t } = useTranslation();
  const [isResourceEdited, setIsResourceEdited] = useRecoilState(
    isResourceEditedState,
  );
  const [isFormOpen, setIsFormOpen] = useRecoilState(isFormOpenState);
  const [selectedSectionIdState, setSelectedSectionIdState] = useState('view');

  const [stickyHeaderHeight, setStickyHeaderHeight] = useState(0);

  useEffect(() => {
    const pageCompClassName = `.page-header${className ? `.${className}` : ''}`;
    setTimeout(() => {
      setStickyHeaderHeight(
        (document.querySelector(pageCompClassName)?.querySelector('header')
          ?.clientHeight ?? 0) +
          (document
            .querySelector(pageCompClassName)
            ?.querySelector('[data-component-name="ObjectPageTabContainer"]')
            ?.clientHeight ?? 0) +
          (document
            .querySelector(pageCompClassName)
            ?.querySelector('[data-component-name="DynamicPageHeader"]')
            ?.clientHeight ?? 0),
      );
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleColumnClose = () => {
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
          showCreate: null,
        })
      : setLayoutColumn({
          ...layoutColumn,
          endColumn: null,
          layout: 'TwoColumnsMidExpanded',
          showCreate: null,
        });
  };

  const actionsBar = (
    <Toolbar
      design="Transparent"
      toolbarStyle="Clear"
      numberOfAlwaysVisibleItems={1}
    >
      <ToolbarSpacer />
      {actions && (
        <div className="page-header__actions">
          {actions}
          {(window.location.search.includes('layout') ||
            (!window.location.search.includes('layout') &&
              layoutColumn?.showCreate?.resourceType)) &&
          layoutNumber !== 'StartColumn' ? (
            <ToolbarSeparator />
          ) : null}
        </div>
      )}
      {window.location.search.includes('layout') ||
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
                  accessibleName="enter-full-screen"
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
                  accessibleName="close-full-screen"
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
                accessibleName="close-column"
                design="Transparent"
                icon="decline"
                onClick={() => {
                  handleActionIfFormOpen(
                    isResourceEdited,
                    setIsResourceEdited,
                    isFormOpen,
                    setIsFormOpen,
                    () => handleColumnClose(),
                  );
                }}
              />
            </>
          ) : null
        ) : null
      ) : null}
    </Toolbar>
  );

  const headerTitle = (
    <DynamicPageTitle
      className={inlineEditForm ? 'no-shadow' : ''}
      style={title === 'Clusters Overview' ? { display: 'none' } : null}
      heading={
        <FlexBox className="title-container" alignItems="Center">
          <Title
            level="H3"
            size="H3"
            className="bold-title"
            wrappingType="None"
          >
            {title}
          </Title>
          {protectedResource && (
            <span className="sap-margin-begin-tiny">
              {protectedResourceWarning}
            </span>
          )}
          {description && (
            <HintButton
              className="sap-margin-tiny"
              setShowTitleDescription={setShowTitleDescription}
              showTitleDescription={showTitleDescription}
              description={description}
              ariaTitle={title}
            />
          )}
        </FlexBox>
      }
      actionsBar={actionsBar}
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
      <DynamicPage
        mode="IconTabBar"
        className={`page-header ${className}`}
        headerPinned
        hidePinButton={true}
        titleArea={headerTitle}
        headerArea={customHeaderContent ?? headerContent}
        selectedSectionId={selectedSectionIdState}
        onSelectedSectionChange={e => {
          if (isFormOpen.formOpen) {
            e.preventDefault();
          }

          handleActionIfFormOpen(
            isResourceEdited,
            setIsResourceEdited,
            isFormOpen,
            setIsFormOpen,
            () => {
              setSelectedSectionIdState(e.detail.selectedSectionId);
              setIsResourceEdited({
                isEdited: false,
              });
            },
          );

          if (e.detail.selectedSectionI === 'edit') {
            setIsFormOpen({ formOpen: true });
          }
        }}
      >
        <TabContainer
          onTabSelect={event => {
            const mode = event.detail.tab.getAttribute('data-mode');
            setSelectedSectionIdState(mode);
          }}
        >
          <Tab data-mode="view" text={t('common.tabs.view')}></Tab>
          <Tab
            data-mode="edit"
            text={showYamlTab ? t('common.tabs.yaml') : t('common.tabs.edit')}
          ></Tab>
        </TabContainer>

        {selectedSectionIdState === 'view' && content}

        {selectedSectionIdState === 'edit' &&
          inlineEditForm(stickyHeaderHeight)}
      </DynamicPage>
    );
  }

  return (
    <DynamicPage
      className="page-header"
      hidePinButton
      titleArea={headerTitle}
      headerArea={headerContent}
      footerArea={footer}
    >
      {typeof content === 'function' ? content(stickyHeaderHeight) : content}
    </DynamicPage>
  );
};
DynamicPageComponent.Column = Column;

DynamicPageComponent.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
};
