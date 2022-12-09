import React from 'react';
import { render } from 'testing/reactTestingUtils';

import { PageHeader } from 'shared/components/PageHeader/PageHeader';

describe('PageHeader', () => {
  it('Renders title', () => {
    const { getByText } = render(<PageHeader title="page title" />);

    expect(getByText('page title')).toBeInTheDocument();
  });

  it('Renders actions', () => {
    const { getByLabelText } = render(
      <PageHeader
        title="page title"
        actions={<button aria-label="abc"></button>}
      />,
    );

    expect(getByLabelText('abc')).toBeInTheDocument();
  });

  it('Renders one breadcrumbItem with link', () => {
    const breadcrumbItems = [{ name: 'item1', url: 'path1' }];
    const { getByText } = render(
      <PageHeader title="page title" breadcrumbItems={breadcrumbItems} />,
    );

    const anchorElement = getByText('item1');
    expect(anchorElement).toBeInTheDocument();

    const hrefAttribute = anchorElement.getAttribute('href');
    expect(hrefAttribute).toBe(`/${breadcrumbItems[0].url}`);
  });
});
