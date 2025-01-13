document.getElementsByClassName('monaco')[0].setProp('on-change', value => {
  document.getElementsByClassName('monaco')[0].setAttribute('value', value);
});

function renderEditForm(stickyHeaderHeight) {
  const formContainer = document.createElement('div');
  formContainer.classList.add('edit-form-test');

  const form = document.createElement('form');

  const nameLabel = document.createElement('label');
  nameLabel.setAttribute('for', 'name');
  nameLabel.textContent = 'Name:';
  const nameInput = document.createElement('input');
  nameInput.setAttribute('type', 'text');
  nameInput.setAttribute('id', 'name');
  nameInput.setAttribute('name', 'name');
  nameInput.setAttribute('value', 'John Doe');
  nameInput.setAttribute('placeholder', 'Enter your name');

  const submitButton = document.createElement('button');
  submitButton.textContent = 'Submit';
  submitButton.setAttribute('type', 'submit');
  submitButton.disabled = false;

  form.appendChild(nameLabel);
  form.appendChild(nameInput);
  form.appendChild(submitButton);

  formContainer.appendChild(form);

  return formContainer;
}

document
  .getElementsByClassName('dynamic-page')[0]
  .setProp('inline-edit-form', renderEditForm);

document
  .getElementsByClassName('dynamic-page')[0]
  .setProp('custom-action-if-form-open', () => {
    return;
  });

const renderContent = () => {
  const text = document.createElement('ui5-text');
  text.innerText = 'Lorem ipsum.';
  return text;
};

document
  .getElementsByClassName('dynamic-page')[0]
  .setSlot('content', renderContent());
