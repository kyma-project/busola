import { RecoilRoot } from 'recoil';
import createWebComponent from './createWebComponent';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { ThemeProvider } from '@ui5/webcomponents-react';

function DynamicPageWithRecoil(props) {
  const transformedForm = stickyHeaderHeight => {
    if (props.inlineEditForm)
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: props.inlineEditForm(stickyHeaderHeight).outerHTML,
          }}
        />
      );
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
);
