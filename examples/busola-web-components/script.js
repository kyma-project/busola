class MyCustomPage extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });

    // Add basic styling
    const style = document.createElement('style');
    style.textContent = `
       .edit-form-inline, #monaco-editor-panel {
         margin: 1rem;
       }
     `;
    shadow.appendChild(style);

    // Create container
    const container = document.createElement('div');
    container.className = 'container';
    shadow.appendChild(container);

    // Create Dynamic Page
    const dynamicPage = this.createDynamicPage();
    container.appendChild(dynamicPage);
    dynamicPage.setAttribute('title', 'Dynamic Page');
  }

  createDynamicPage() {
    const dynamicPageComponent = document.createElement(
      'dynamic-page-component',
    );
    dynamicPageComponent.setAttribute('title', 'Dynamic Page');
    dynamicPageComponent.classList.add('dynamic-page');

    // Set inlineEditForm function
    dynamicPageComponent.setProp('inline-edit-form', this.renderEditForm);
    // Set custom action when form is open
    dynamicPageComponent.setProp(
      'custom-action-if-form-open',
      this.handleActionIfFormOpen,
    );

    // Set Dynamic Page content
    dynamicPageComponent.setSlot('content', this.createMonacoEditor());

    return dynamicPageComponent;
  }

  // Create Monaco Editor
  createMonacoEditor() {
    const monacoEditorPanel = document.createElement('ui5-panel');
    monacoEditorPanel.setAttribute('id', 'monaco-editor-panel');
    monacoEditorPanel.setAttribute('header-text', 'Monaco editor example');

    const monacoEditor = document.createElement('monaco-editor');
    monacoEditor.classList.add('monaco');
    monacoEditor.setAttribute('value', '');
    monacoEditor.setAttribute('language', 'javascript');
    monacoEditor.setAttribute('height', '200px');
    monacoEditor.setAttribute('placeholder', 'Write something!');
    monacoEditor.setProp('on-change', value => {
      this.setAttribute('value', value);
    });

    monacoEditorPanel.appendChild(monacoEditor);
    return monacoEditorPanel;
  }

  // inlineEditForm function
  renderEditForm() {
    const form = document.createElement('form');
    form.classList.add('edit-form-inline');

    const namePanel = document.createElement('ui5-panel');
    namePanel.setAttribute('header-text', 'Name');

    const nameLabel = document.createElement('ui5-label');
    nameLabel.setAttribute('for', 'name');
    nameLabel.textContent = 'Name:';
    namePanel.appendChild(nameLabel);

    const nameInput = document.createElement('ui5-input');
    nameInput.classList.add('name-input');
    nameInput.setAttribute('id', 'name');
    nameInput.setAttribute('name', 'name');
    nameInput.setAttribute('value', 'John Doe');
    nameInput.setAttribute('placeholder', 'Enter your name');
    nameInput.addEventListener('input', event => {
      console.log('Change!');
    });
    namePanel.appendChild(nameInput);

    const submitButton = document.createElement('ui5-button');
    submitButton.textContent = 'Submit';
    submitButton.setAttribute('type', 'submit');
    submitButton.addEventListener('click', event => {
      event.preventDefault();
      console.log('Submit!');
    });
    form.appendChild(namePanel);
    form.appendChild(submitButton);

    return form;
  }

  handleActionIfFormOpen(
    isResourceEdited,
    setIsResourceEdited,
    isFormOpen,
    setIsFormOpen,
  ) {
    setIsFormOpen({ formOpen: false, leavingForm: false });
  }
}

// Define the custom element
if (!customElements.get('my-custom-page')) {
  customElements.define('my-custom-page', MyCustomPage);
}
