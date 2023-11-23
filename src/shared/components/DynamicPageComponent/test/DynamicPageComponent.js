import React from 'react';
import { Button } from '@ui5/webcomponents-react';
import { render } from 'testing/reactTestingUtils';

import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { ThemeProvider } from '@ui5/webcomponents-react';

describe('DynamicPageComponent', () => {
  it('Renders title', () => {
    const { getByText } = render(
      <ThemeProvider>
        <DynamicPageComponent title="page title" />
      </ThemeProvider>,
    );

    expect(getByText('page title')).toBeInTheDocument();
  });

  it('Renders actions', () => {
    const { getByLabelText } = render(
      <ThemeProvider>
        <DynamicPageComponent
          title="page title"
          actions={<Button aria-label="abc"></Button>}
        />
      </ThemeProvider>,
    );

    expect(getByLabelText('abc')).toBeInTheDocument();
  });

  it('Renders one breadcrumbItem with link', () => {
    const breadcrumbItems = [{ name: 'item1', url: 'path1' }];
    const { getByText } = render(
      <ThemeProvider>
        <DynamicPageComponent
          title="page title"
          breadcrumbItems={breadcrumbItems}
        />
      </ThemeProvider>,
    );

    const anchorElement = getByText('item1');
    expect(anchorElement).toBeInTheDocument();

    const hrefAttribute = anchorElement.getAttribute('href');
    expect(hrefAttribute).toBe(breadcrumbItems[0].url);
  });
});
