import { RecoilRoot } from 'recoil';
import createWebComponent from './createWebComponent';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { ThemeProvider } from '@ui5/webcomponents-react';
import customCSS from 'shared/components/DynamicPageComponent/DynamicPageComponent.scss?inline';
import { styleData as pageCSS } from '@ui5/webcomponents-react/dist/components/DynamicPage/DynamicPage.module.css.js?inline';
import { styleData as titleCSS } from '@ui5/webcomponents-react/dist/components/DynamicPageTitle/DynamicPageTitle.module.css.js?inline';
import { styleData as headerCSS } from '@ui5/webcomponents-react/dist/components/DynamicPageHeader/DynamicPageHeader.module.css.js?inline';
import objectPageCSS from '@ui5/webcomponents-react/dist/css/components/ObjectPage/ObjectPage.module.css?inline';
import { parseHtmlToJsx } from './htmlTojsx';

function DynamicPageWithRecoil(props) {
  const transformedForm = stickyHeaderHeight => {
    if (props.inlineEditForm)
      return parseHtmlToJsx(props.inlineEditForm(stickyHeaderHeight));
    else return null;
  };

  return (
    <RecoilRoot>
      <ThemeProvider>
        <DynamicPageComponent
          {...props}
          inlineEditForm={props?.inlineEditForm ? transformedForm : undefined}
        />
      </ThemeProvider>
    </RecoilRoot>
  );
}

createWebComponent(
  'dynamic-page-component',
  DynamicPageWithRecoil,
  {
    headerContent: null,
    title: '',
    description: '',
    actions: null,
    children: null,
    columnWrapperClassName: '',
    content: null,
    footer: null,
    layoutNumber: null,
    layoutCloseUrl: null,
    inlineEditForm: null,
    showYamlTab: false,
    protectedResource: false,
    protectedResourceWarning: null,
    className: '',
    customActionIfFormOpen: undefined,
  },
  [
    'header-content',
    'title',
    'description',
    'actions',
    'column-wrapper-class-name',
    'content',
    'footer',
    'layout-number',
    'layout-close-url',
    'inline-edit-form',
    'show-yaml-tab',
    'protected-resource',
    'protected-resource-warning',
    'class-name',
    'custom-action-if-form-open',
  ], // Observed attributes
  // Can be cleaned up after migration to UI5 V2
  `${pageCSS.content}\n${headerCSS.content}\n${titleCSS.content}\n${objectPageCSS}\n${customCSS}\n
  [data-component-name=ObjectPageTopHeader] [data-component-name=DynamicPageTitle] {
    grid-column: 2;
    padding-inline: 0;
  }
  [data-component-name=ObjectPageTopHeader] {
    padding-inline: 2rem;
    background-color: var(--sapObjectHeader_Background);
  }
  ui5-title[level=H3] {
    line-height: calc(var(--sapFontHeader3Size)* 1.15);
  }
  `,
);
