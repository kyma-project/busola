/* global cy */
import TasksList from './TasksList';
import { MessageChunk } from '../Message/Message';

describe('TasksList Component', () => {
  it('displays a busy indicator when messageChunks is empty', () => {
    cy.mount(<TasksList messageChunks={[]} />);

    cy.get('.ai-busy-indicator').should('exist');
    cy.get('ui5-busy-indicator').should('have.attr', 'active');
    cy.get('ui5-busy-indicator').should('have.attr', 'size', 'M');
    cy.get('ui5-busy-indicator').should('have.attr', 'delay', '0');
  });

  it('renders task items when messageChunks contain tasks', () => {
    const messageChunks: MessageChunk[] = [
      {
        data: {
          answer: {
            content: '',
            tasks: [
              {
                task_name: 'Task 1',
                status: 'completed',
                task_id: 0,
                agent: 'agent1',
              },
              {
                task_name: 'Task 2',
                status: 'pending',
                task_id: 1,
                agent: 'agent2',
              },
              {
                task_name: 'Task 3',
                status: 'pending',
                task_id: 2,
                agent: 'agent3',
              },
            ],
            next: '',
          },
        },
      },
    ];

    cy.mount(<TasksList messageChunks={messageChunks} />);

    cy.get('.loading-item').should('have.length', 3);
    cy.contains('.text', 'Task 1').should('exist');
    cy.get('.loading-item')
      .eq(0)
      .find('div')
      .should('exist')
      .and('have.attr', 'class')
      .and('match', /objectStatus.*positive.*large/);

    cy.get('.loading-item')
      .eq(0)
      .find('.ai-steps-loader')
      .should('not.exist');

    cy.contains('.text', 'Task 2').should('exist');
    cy.get('.loading-item')
      .eq(1)
      .find('.ai-steps-loader')
      .should('exist');
    cy.contains('.text', 'Task 3').should('exist');
    cy.get('.loading-item')
      .eq(2)
      .find('.ai-steps-loader')
      .should('exist');
  });

  it('shows "preparing final answer" message when all tasks are completed', () => {
    const messageChunks: MessageChunk[] = [
      {
        data: {
          answer: {
            content: '',
            tasks: [
              {
                task_name: 'Task 1',
                status: 'completed',
                task_id: 0,
                agent: 'agent1',
              },
              {
                task_name: 'Task 2',
                status: 'completed',
                task_id: 1,
                agent: 'agent2',
              },
            ],
            next: '',
          },
        },
      },
    ];

    cy.mount(<TasksList messageChunks={messageChunks} />);

    cy.get('.loading-item').should('have.length', 3);
    cy.contains('.text', 'kyma-companion.opener.preparing-final-answer').should(
      'exist',
    );
    cy.get('.loading-item')
      .eq(2)
      .find('.ai-steps-loader')
      .should('exist');
  });

  it('does not show "preparing final answer" message when not all tasks are completed', () => {
    const messageChunks: MessageChunk[] = [
      {
        data: {
          answer: {
            content: '',
            tasks: [
              {
                task_name: 'Task 1',
                status: 'completed',
                task_id: 0,
                agent: 'agent1',
              },
              {
                task_name: 'Task 2',
                status: 'pending',
                task_id: 1,
                agent: 'agent2',
              },
            ],
            next: '',
          },
        },
      },
    ];

    cy.mount(<TasksList messageChunks={messageChunks} />);

    cy.get('.loading-item').should('have.length', 2);
    cy.contains('.text', 'kyma-companion.opener.preparing-final-answer').should(
      'not.exist',
    );
  });

  it('handles multiple message chunks and uses the last one', () => {
    const messageChunks: MessageChunk[] = [
      {
        data: {
          answer: {
            content: '',
            tasks: [
              {
                task_name: 'Old Task 1',
                status: 'pending',
                task_id: 0,
                agent: 'agent1',
              },
            ],
            next: '',
          },
        },
      },
      {
        data: {
          answer: {
            content: '',
            tasks: [
              {
                task_name: 'New Task 1',
                status: 'completed',
                task_id: 0,
                agent: 'agent1',
              },
              {
                task_name: 'New Task 2',
                status: 'completed',
                task_id: 0,
                agent: 'agent2',
              },
            ],
            next: '',
          },
        },
      },
    ];

    cy.mount(<TasksList messageChunks={messageChunks} />);

    cy.contains('.text', 'Old Task 1').should('not.exist');
    cy.contains('.text', 'New Task 1').should('exist');
    cy.contains('.text', 'New Task 2').should('exist');
    cy.contains('.text', 'kyma-companion.opener.preparing-final-answer').should(
      'exist',
    );
  });

  it('checks for correct layout and styling of task items', () => {
    const messageChunks: MessageChunk[] = [
      {
        data: {
          answer: {
            content: '',
            tasks: [
              {
                task_name: 'Task 1',
                status: 'completed',
                task_id: 0,
                agent: 'agent1',
              },
              {
                task_name: 'Task 2',
                status: 'completed',
                task_id: 0,
                agent: 'agent2',
              },
            ],
            next: '',
          },
        },
      },
    ];

    cy.mount(<TasksList messageChunks={messageChunks} />);

    cy.get('.tasks-list').should('exist');
    cy.get('.loading-item').should('exist');
    cy.get('.loading-item').should(
      'have.css',
      'justify-content',
      'space-between',
    );
    cy.get('.loading-item').should('have.css', 'align-items', 'center');
    cy.get('.text').should('exist');
    cy.get('.ai-steps-loader').should('exist');
  });

  it('handles undefined tasks gracefully', () => {
    const messageChunks: any[] = [
      {
        data: {
          answer: {
            // No tasks property
          },
        },
      },
    ];

    cy.mount(<TasksList messageChunks={messageChunks} />);

    cy.get('.loading-item').should('not.exist');
  });
});
