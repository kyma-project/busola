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
            __html: props.inlineEditForm(stickyHeaderHeight),
          }}
        />
      );
    else return null;
  };

  console.log(transformedForm());
  return (
    <RecoilRoot>
      <ThemeProvider>
        <DynamicPageComponent
          {...props}
          inlineEditForm={stickyHeaderHeight => (
            <div>test{stickyHeaderHeight}</div>
          )}
        />
      </ThemeProvider>
    </RecoilRoot>
  );
}

createWebComponent(
  'dynamic-page-component',
  DynamicPageWithRecoil,
  {
    headerContent: null, //slot
    title: '',
    description: '',
    actions: null, //slot
    children: null,
    columnWrapperClassName: '',
    content: null, // slot
    footer: null, // slot
    layoutNumber: null,
    layoutCloseUrl: null,
    inlineEditForm: null,
    showYamlTab: false,
    protectedResource: false,
    protectedResourceWarning: null, //can be a slot
    className: '',
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
  ], // Observed attributes
);
