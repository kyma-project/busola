# Overview

To contribute to this project, follow the rules from the general [CONTRIBUTING.md](https://github.com/kyma-project/community/blob/main/CONTRIBUTING.md) document in the `community` repository.

## UX DoD Requirements

### General information

UI developed within Busola should be compliant with [Fiori Design Guidelines](https://experience.sap.com/fiori-design-web/).

### Additional guidelines for modals

- User should be able to close the modal (without saving changes, if any) by clicking anywhere outside of it.
- Modal should support keyboard control:
  - User should always be able to navigate the modal using only a keyboard. While the modal is opened, focus should not leave the modal window.
  - If the modal contains input fields, the first of them should be automatically focused on opening the modal. In some cases, we can set focus on the most important element instead (e.g. the incorrect one).
  - Main actions, such as **Confirm**, **Save**, **Apply**, should use the [emphasized style](https://experience.sap.com/fiori-design-web/button).
- If the content of the modal is dynamic, avoid resizing the modal. Modals width should be consistent across the application.
- Follow the [ARIA](https://www.w3.org/WAI/standards-guidelines/aria/) attributes.

## Code Guidelines

- Keep functions small.
- Modularize - functions and components should be doing just one task.
- Functions shouldn't have too many arguments.
- Avoid heavy nesting.
- Maintain a single layer of abstraction at a time.
- Use intention revealing and searchable names.
- Don't use comments when you can use a variable.
- You must be able to explain your code in a simple language (understand the algorithm).
- Don't use the `any` type, this is the last resort.
- Try to keep the Pull Request small if possible. Split big PRs into smaller ones, keep it civil for a reviewer.
- Use translations instead of a simple string.
- Organise files related to the same component in one folder.
- Write tests for new components.
