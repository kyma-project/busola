/* global cy */
import { t } from 'i18next';
import Message from './Message';

describe('Message Component', () => {
  it('renders user message correctly', () => {
    const messageChunks = [
      {
        data: {
          answer: {
            content: 'Hello, this is a user message',
            next: '__end__',
          },
        },
      },
    ];

    cy.mount(
      <Message
        author="user"
        messageChunks={messageChunks}
        isLoading={false}
        hasError={false}
        isLatestMessage={true}
      />,
    );

    cy.get('.message-container').should('have.class', 'right-aligned');
    cy.get('.message').should('have.class', 'right-aligned');
    cy.get('.message').should('not.have.class', 'error');
    cy.contains('Hello, this is a user message').should('exist');
  });

  it('renders AI message correctly', () => {
    const messageChunks = [
      {
        data: {
          answer: {
            content: 'Hello, this is an AI response',
            next: '__end__',
          },
        },
      },
    ];

    cy.mount(
      <Message
        author="ai"
        messageChunks={messageChunks}
        isLoading={false}
        hasError={false}
        isLatestMessage={true}
      />,
    );

    cy.get('.message-container').should('have.class', 'left-aligned');
    cy.get('.message').should('have.class', 'left-aligned');
    cy.get('.message').should('not.have.class', 'error');
    cy.contains('Hello, this is an AI response').should('exist');
  });

  it('renders TasksList when isLoading is true', () => {
    const messageChunks = [
      {
        data: {
          answer: {
            content: '',
            tasks: [
              {
                task_id: 1,
                task_name: 'Task 1',
                status: 'pending',
                agent: '',
              },
            ],
            next: '',
          },
        },
      },
    ];

    cy.mount(
      <Message
        author="ai"
        messageChunks={messageChunks}
        isLoading={true}
        hasError={false}
        isLatestMessage={false}
      />,
    );

    cy.get('.message-container').should('not.exist');
    cy.get('.tasks-list').should('exist');
  });

  it('displays error for user message when hasError is true and not latest message', () => {
    const messageChunks = [
      {
        data: {
          answer: {
            content: 'User message with error',
            next: '__end__',
          },
        },
      },
    ];

    cy.mount(
      <Message
        author="user"
        messageChunks={messageChunks}
        isLoading={false}
        hasError={true}
        isLatestMessage={false}
      />,
    );

    cy.get('.message').should('have.class', 'error');
    cy.get('.message-error').should('be.visible');
    cy.get('.error-text').should(
      'contain',
      t('kyma-companion.error.chat-error'),
    );
    cy.get('.error-icon').should('exist');
  });

  it('displays error for AI message when hasError is true and is latest message', () => {
    const messageChunks = [
      {
        data: {
          answer: {
            content: 'AI message with error',
            next: '',
          },
        },
      },
    ];

    cy.mount(
      <Message
        author="ai"
        messageChunks={messageChunks}
        isLoading={false}
        hasError={true}
        isLatestMessage={true}
      />,
    );

    cy.get('.message').should('have.class', 'error');
    cy.get('.message-error').should('be.visible');
    cy.get('.error-text').should(
      'contain',
      t('kyma-companion.error.suggestions-error'),
    );
    cy.get('.error-icon').should('exist');
  });

  it('does not display error for AI message when hasError is true but is not latest message', () => {
    const messageChunks = [
      {
        data: {
          answer: {
            content: 'AI message without error display',
            next: '',
          },
        },
      },
    ];

    cy.mount(
      <Message
        author="ai"
        messageChunks={messageChunks}
        isLoading={false}
        hasError={true}
        isLatestMessage={false}
      />,
    );

    cy.get('.message').should('not.have.class', 'error');
    cy.get('.message-error').should('not.exist');
  });

  it('uses the last chunk from messageChunks array', () => {
    const messageChunks = [
      {
        data: {
          answer: {
            content: 'First chunk',
            next: '',
          },
        },
      },
      {
        data: {
          answer: {
            content: 'Second chunk',
            next: '',
          },
        },
      },
      {
        data: {
          answer: {
            content: 'Last chunk',
            next: '',
          },
        },
      },
    ];

    cy.mount(
      <Message
        author="ai"
        messageChunks={messageChunks}
        isLoading={false}
        hasError={false}
        isLatestMessage={true}
      />,
    );

    cy.contains('Last chunk').should('exist');
    cy.contains('First chunk').should('not.exist');
  });
});
