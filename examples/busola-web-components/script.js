class MyCustomElement extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });

    // Add basic styling
    const style = document.createElement('style');
    style.textContent = `
       .dynamic-page-panel {
         margin-bottom: 1rem;
       }
     `;
    shadow.appendChild(style);

    // Create container
    const container = document.createElement('div');
    container.className = 'container';
    shadow.appendChild(container);

    // Create Dynamic Page Panel
    const dynamicPagePanel = this.createDynamicPagePanel();
    container.appendChild(dynamicPagePanel);

    // Create Monaco Editor Panel
    const monacoEditorPanel = this.createMonacoEditorPanel();
    container.appendChild(monacoEditorPanel);
  }

  createDynamicPagePanel() {
    const dynamicPagePanel = document.createElement('ui5-panel');
    dynamicPagePanel.setAttribute('header-text', 'Dynamic Page example');
    dynamicPagePanel.classList.add('dynamic-page-panel');

    const dynamicPageComponent = document.createElement(
      'dynamic-page-component',
    );
    dynamicPageComponent.setAttribute('title', 'Dynamic Page');
    dynamicPageComponent.classList.add('dynamic-page');

    // Set inline edit form function
    dynamicPageComponent.setProp('inline-edit-form', this.renderEditForm);
    // Set custom action when form is open
    dynamicPageComponent.setProp(
      'custom-action-if-form-open',
      this.handleActionIfFormOpen,
    );

    // Set Dynamic Page content
    dynamicPageComponent.setSlot('content', this.renderContent());

    dynamicPagePanel.appendChild(dynamicPageComponent);
    return dynamicPagePanel;
  }

  createMonacoEditorPanel() {
    const monacoEditorPanel = document.createElement('ui5-panel');
    monacoEditorPanel.setAttribute('header-text', 'Monaco editor example');

    const monacoEditor = document.createElement('monaco-editor');
    monacoEditor.classList.add('monaco');
    monacoEditor.setAttribute('value', '');
    monacoEditor.setAttribute('language', 'javascript');
    monacoEditor.setAttribute('height', '200px');
    monacoEditor.setAttribute('placeholder', 'Write something!');
    monacoEditor.setProp('on-change', value => {
      monacoEditor.setAttribute('value', value);
    });

    monacoEditorPanel.appendChild(monacoEditor);
    return monacoEditorPanel;
  }

  renderEditForm() {
    const formContainer = document.createElement('div');
    formContainer.classList.add('edit-form-test');

    const form = document.createElement('form');

    const nameLabel = document.createElement('ui5-label');
    nameLabel.setAttribute('for', 'name');
    nameLabel.textContent = 'Name:';
    form.appendChild(nameLabel);

    const nameInput = document.createElement('ui5-input');
    nameInput.setAttribute('id', 'name');
    nameInput.setAttribute('name', 'name');
    nameInput.setAttribute('value', 'John Doe');
    nameInput.setAttribute('placeholder', 'Enter your name');
    form.appendChild(nameInput);

    const submitButton = document.createElement('ui5-button');
    submitButton.textContent = 'Submit';
    submitButton.setAttribute('type', 'submit');
    form.appendChild(submitButton);

    formContainer.appendChild(form);
    return formContainer;
  }

  handleActionIfFormOpen(
    isResourceEdited,
    setIsResourceEdited,
    isFormOpen,
    setIsFormOpen,
  ) {
    setIsFormOpen({ formOpen: false, leavingForm: false });
  }

  renderContent() {
    const text = document.createElement('ui5-text');
    text.innerText = 'Lorem ipsum.';
    return text;
  }
}

// Define the custom element
customElements.define('my-custom-element', MyCustomElement);
