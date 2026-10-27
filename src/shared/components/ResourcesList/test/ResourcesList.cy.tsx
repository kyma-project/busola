/* global cy, describe, it */
import { useLocation } from 'react-router';
import { ResourcesList } from '../ResourcesList';

function LocationDisplay() {
  const location = useLocation();
  return <span data-testid="location-search">{location.search}</span>;
}

const mockResources = [
  {
    apiVersion: 'v1',
    kind: 'ConfigMap',
    metadata: {
      name: 'my-config',
      namespace: 'default',
      creationTimestamp: '2024-01-15T10:00:00Z',
    },
  },
  {
    apiVersion: 'v1',
    kind: 'ConfigMap',
    metadata: {
      name: 'app-settings',
      namespace: 'default',
      creationTimestamp: '2024-01-10T08:00:00Z',
    },
  },
];

const baseProps = {
  resourceUrl: '/api/v1/namespaces/default/configmaps',
  resourceType: 'ConfigMaps',
  resourceTitle: 'ConfigMap',
  namespace: 'default',
  isCompact: true,
};

describe('ResourcesList', () => {
  it('renders resource names', () => {
    cy.mount(<ResourcesList {...baseProps} resources={mockResources} />);

    cy.contains('my-config').should('be.visible');
    cy.contains('app-settings').should('be.visible');
  });

  it('shows empty state when resources array is empty', () => {
    cy.mount(<ResourcesList {...baseProps} resources={[]} />);

    cy.get('section[aria-labelledby="empty-list-title"]').should('exist');
  });

  it('shows loading spinner when loading is true', () => {
    cy.mount(
      <ResourcesList {...baseProps} resources={mockResources} loading={true} />,
    );

    cy.get('[aria-label="Loading"]').should('exist');
  });

  it('shows error message on server error', () => {
    cy.mount(
      <ResourcesList
        {...baseProps}
        resources={mockResources}
        error={{ message: 'Connection refused', originalMessage: '' }}
      />,
    );

    cy.contains(/Connection refused/i).should('exist');
  });

  describe('Actions column', () => {
    it('shows actions column by default', () => {
      cy.mount(<ResourcesList {...baseProps} resources={mockResources} />);

      cy.get('[aria-label="actions-column"]').should('exist');
    });

    it('hides actions column when readOnly is true', () => {
      cy.mount(
        <ResourcesList
          {...baseProps}
          resources={mockResources}
          readOnly={true}
        />,
      );

      cy.get('[aria-label="actions-column"]').should('not.exist');
    });
  });

  describe('Create button', () => {
    it('shows create button when createResourceForm is configured', () => {
      cy.mount(
        <ResourcesList
          {...baseProps}
          resources={mockResources}
          createResourceForm={{}}
        />,
      );

      cy.get('[data-testid="create-ConfigMaps"]').should('exist');
    });

    it('hides create button when disableCreate is true', () => {
      cy.mount(
        <ResourcesList
          {...baseProps}
          resources={mockResources}
          createResourceForm={{}}
          disableCreate={true}
        />,
      );

      cy.get('[data-testid="create-ConfigMaps"]').should('not.exist');
    });

    it('clicking create button navigates to create view', () => {
      cy.mount(
        <>
          <ResourcesList
            {...baseProps}
            resources={mockResources}
            createResourceForm={{}}
          />
          <LocationDisplay />
        </>,
      );

      cy.get('[data-testid="create-ConfigMaps"]')
        .first()
        .click({ force: true });
      cy.get('[data-testid="location-search"]')
        .invoke('text')
        .should('include', 'showCreate=true');
    });
  });
});
