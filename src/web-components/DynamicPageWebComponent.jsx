import { Provider, atom, useAtomValue, createStore } from 'jotai';
import createWebComponent from './createWebComponent';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { ThemeProvider } from '@ui5/webcomponents-react';
import customCSS from 'shared/components/DynamicPageComponent/DynamicPageComponent.scss?inline';
import { parseHtmlToJsx } from './htmlTojsx';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { Suspense, useCallback, useEffect, useMemo } from 'react';

const webComponentPropsAtom = atom({});
webComponentPropsAtom.debugLabel = 'webComponentPropsAtom';

const DynamicPageWrapper = () => {
  const props = useAtomValue(webComponentPropsAtom);

  const { inlineEditForm } = props;

  const transformedForm = useCallback(
    (stickyHeaderHeight) => {
      if (inlineEditForm) {
        return parseHtmlToJsx(inlineEditForm(stickyHeaderHeight));
      }
      return null;
    },
    [inlineEditForm],
  );

  return (
    <Suspense fallback={<Spinner />}>
      <DynamicPageComponent
        {...props}
        inlineEditForm={inlineEditForm ? transformedForm : undefined}
      />
    </Suspense>
  );
};

function DynamicPageWithJotai(props) {
  const store = useMemo(() => createStore(), []);

  useEffect(() => {
    store.set(webComponentPropsAtom, props);
  }, [props, store]);

  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          path: '*',
          element: (
            <Suspense fallback={<Spinner />}>
              <DynamicPageWrapper />
            </Suspense>
          ),
        },
      ]),
    [],
  );

  return (
    <Provider store={store}>
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
