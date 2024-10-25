import PropTypes from 'prop-types';
import {
  Button,
  DynamicPage,
  FlexBox,
  ObjectPage,
  ObjectPageHeader,
  ObjectPageSection,
  ObjectPageTitle,
  DynamicPageHeader,
  DynamicPageTitle,
  Title,
} from '@ui5/webcomponents-react';

import './DynamicPageComponent.scss';
import { spacing } from 'shared/helpers/spacing';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { HintButton } from '../DescriptionHint/DescriptionHint';
import { isResourceEditedState } from 'state/resourceEditedAtom';
import { isFormOpenState } from 'state/formOpenAtom';
import { handleActionIfFormOpen } from '../UnsavedMessageBox/helpers';

const useGetHeaderHeight = dynamicPageRef => {
  const [headerHeight, setHeaderHeight] = useState(undefined);
  useEffect(() => {
    const headerObserver = new ResizeObserver(([header]) => {
      setHeaderHeight(header.contentRect.height);
    });
    if (dynamicPageRef.current) {
      // wait for the custom element to be defined (adjust the tag-name if you're using the scoping feature)
      void customElements.whenDefined('ui5-dynamic-page').then(() => {
        const { shadowRoot } = dynamicPageRef.current;

        // wait for the shadowRoot to be populated
        const shadowRootObserver = new MutationObserver(() => {
          const header = shadowRoot.querySelector('header');
          if (header) {
            shadowRootObserver.disconnect();
            headerObserver.observe(header);
          }
        });

        if (shadowRoot && shadowRoot.childElementCount) {
          headerObserver.observe(shadowRoot.querySelector('header'));
        } else {
          shadowRootObserver.observe(shadowRoot, { childList: true });
        }
      });
    }
    return () => {
      headerObserver.disconnect();
    };
  }, []);
  return headerHeight;
};

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
  description,
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

  const dynamicPageRef = useRef(null);
  const headerHeight = useGetHeaderHeight(dynamicPageRef);

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

  const headerTitle = inlineEditForm ? (
    <ObjectPageTitle
      style={title === 'Clusters Overview' ? { display: 'none' } : null}
      header={
        <FlexBox alignItems="Center">
          <Title level="H3" size="H3" className="bold-title">
            {title}
          </Title>
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
              ariaTitle={title}
            />
          )}
        </FlexBox>
      }
      actionsBar={
        <>
          {actions && (
            <div className="page-header__actions">
              {actions}
              {(window.location.search.includes('layout') ||
                (!window.location.search.includes('layout') &&
                  layoutColumn?.showCreate?.resourceType)) &&
              layoutNumber !== 'StartColumn' ? (
                <span className="separator" />
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
        </>
      }
    />
  ) : (
    <DynamicPageTitle
      style={title === 'Clusters Overview' ? { display: 'none' } : null}
      heading={
        <FlexBox alignItems="Center" justifyContent="Center">
          <Title
            style={{ fontSize: 'var(--sapObjectHeader_Title_FontSize)' }}
            level="H3"
            size="H3"
            className="bold-title"
          >
            {title}
          </Title>
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
              ariaTitle={title}
            />
          )}
        </FlexBox>
      }
      actionsBar={
        <>
          {actions && (
            <div className="page-header__actions">
              {actions}
              {(window.location.search.includes('layout') ||
                (!window.location.search.includes('layout') &&
                  layoutColumn?.showCreate?.resourceType)) &&
              layoutNumber !== 'StartColumn' ? (
                <span className="separator" />
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
        </>
      }
    />
  );

  const headerContent = inlineEditForm ? (
    <>
      {title !== 'Clusters Overview' && children ? (
        <ObjectPageHeader className="header-wrapper">
          <section className={`column-wrapper ${columnWrapperClassName || ''}`}>
            {children}
          </section>
        </ObjectPageHeader>
      ) : null}
    </>
  ) : (
    <>
      {title !== 'Clusters Overview' && children ? (
        <DynamicPageHeader className="header-wrapper">
          <section className={`column-wrapper ${columnWrapperClassName || ''}`}>
            {children}
          </section>
        </DynamicPageHeader>
      ) : null}
    </>
  );

  const [stickyHeaderHeight, setStickyHeaderHeight] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setStickyHeaderHeight(
        (document.querySelector('.page-header')?.querySelector('header')
          ?.clientHeight ?? 0) +
          (document
            .querySelector('.page-header')
            ?.querySelector('ui5-tabcontainer')?.clientHeight ?? 0),
      );
    });
  }, []);

  if (inlineEditForm) {
    return (
      <ObjectPage
        mode="IconTabBar"
        className={`page-header ${className}`}
        headerPinned
        alwaysShowContentHeader
        hidePinButton={true}
        titleArea={headerTitle}
        headerArea={customHeaderContent ?? headerContent}
        selectedSectionId={selectedSectionIdState}
        onBeforeNavigate={e => {
          if (isFormOpen.formOpen) {
            e.preventDefault();
          }

          handleActionIfFormOpen(
            isResourceEdited,
            setIsResourceEdited,
            isFormOpen,
            setIsFormOpen,
            () => {
              setSelectedSectionIdState(e.detail.sectionId);
              setIsResourceEdited({
                isEdited: false,
              });
            },
          );

          if (e.detail.sectionId === 'edit') {
            setIsFormOpen({ formOpen: true });
          }
        }}
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
          {inlineEditForm(stickyHeaderHeight)}
        </ObjectPageSection>
      </ObjectPage>
    );
  }

  return (
    <DynamicPage
      className="page-header"
      hidePinButton
      titleArea={headerTitle}
      headerArea={headerContent}
      footerArea={footer}
      ref={dynamicPageRef}
    >
      {typeof content === 'function' ? content(headerHeight) : content}
    </DynamicPage>
  );
};
DynamicPageComponent.Column = Column;

DynamicPageComponent.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
};

DynamicPageComponent.defaultProps = {
  description: '',
};
