import React from 'react';
import { render } from 'testing/reactTestingUtils';

import { ResourceNotFound } from 'shared/components/ResourceNotFound/ResourceNotFound';

const breadcrumbs = [
  { name: 'test-1', url: '/' },
  { name: 'test-2', url: '/test' },
];

describe('ResourceNotFound', () => {
  it('Renders resource type and breadcrumb', () => {
    const { queryByText } = render(
      <ResourceNotFound resource="Resource" breadcrumbs={breadcrumbs} />,
    );
    expect(
      queryByText('components.resource-not-found.messages.not-found'),
    ).toBeInTheDocument();

    expect(queryByText(breadcrumbs[0].name)).toBeInTheDocument();
    expect(queryByText(breadcrumbs[1].name)).toBeInTheDocument();
  });

  it('Renders custom message', () => {
    const message = 'Error';

    const { queryByText } = render(
      <ResourceNotFound
        resource="Resource"
        breadcrumbs={breadcrumbs}
        customMessage={message}
      />,
    );

    expect(queryByText(message)).toBeInTheDocument();
  });
});
