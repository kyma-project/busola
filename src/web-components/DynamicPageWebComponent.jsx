import { Provider } from 'jotai';
import createWebComponent from './createWebComponent';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { ThemeProvider } from '@ui5/webcomponents-react';
import customCSS from 'shared/components/DynamicPageComponent/DynamicPageComponent.scss?inline';
import { parseHtmlToJsx } from './htmlTojsx';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { Suspense, useMemo } from 'react';

function DynamicPageWithJotai(props) {
  const transformedForm = (stickyHeaderHeight) => {
    if (props.inlineEditForm)
      return parseHtmlToJsx(props.inlineEditForm(stickyHeaderHeight));
    else return null;
  };

  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          path: '*',
          element: (
            <Suspense fallback={<Spinner />}>
              <DynamicPageComponent
                {...props}
                inlineEditForm={
                  props?.inlineEditForm ? transformedForm : undefined
                }
              />
            </Suspense>
          ),
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
      ]),
    [props],
  );

  return (
    <Provider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  );
}

createWebComponent(
  'dynamic-page-component',
  DynamicPageWithJotai,
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
  `${customCSS}\n`,
);
