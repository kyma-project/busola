Cypress.Commands.add('handleExceptions', () => {
  Cypress.on('uncaught:exception', err => {
    if (err.message.includes('ResizeObserver loop limit exceeded'))
      return false;
  });
});
