import { validateFormElement } from './validateFormElement';

function makeInput({ required = false, value = '' } = {}) {
  const input = document.createElement('ui5-input');
  input.required = required;
  input.value = value;
  return input;
}

function makeFormField({ required = false, value = '' } = {}) {
  const field = document.createElement('div');
  field.classList.add('form-field');
  field.appendChild(makeInput({ required, value }));
  return field;
}

function makeSection({ required = false, children = [] } = {}) {
  const section = document.createElement('div');
  section.classList.add('resource-form__collapsible-section');
  if (required) section.classList.add('required');
  const content = document.createElement('div');
  content.classList.add('content');
  children.forEach((c) => content.appendChild(c));
  section.appendChild(content);
  return section;
}

function makeContainer(children = []) {
  const container = document.createElement('div');
  children.forEach((c) => container.appendChild(c));
  return container;
}

describe('validateFormElement — optional required fields', () => {
  it('is invalid when a non-required section contains an empty required field', () => {
    const container = makeContainer([
      makeSection({
        required: false,
        children: [makeFormField({ required: true, value: '' })],
      }),
    ]);

    expect(validateFormElement(container, false).valid).toBe(false);
  });

  it('is valid when a non-required section contains a filled required field', () => {
    const container = makeContainer([
      makeSection({
        required: false,
        children: [makeFormField({ required: true, value: 'some-value' })],
      }),
    ]);

    expect(validateFormElement(container, false).valid).toBe(true);
  });

  it('is valid when a non-required section contains only empty non-required fields', () => {
    const container = makeContainer([
      makeSection({
        required: false,
        children: [makeFormField({ required: false, value: '' })],
      }),
    ]);

    expect(validateFormElement(container, false).valid).toBe(true);
  });

  it('is invalid when the whole form is required and a field is empty', () => {
    const container = makeContainer([
      makeFormField({ required: true, value: '' }),
    ]);

    expect(validateFormElement(container, true).valid).toBe(false);
  });

  it('is valid when the whole form is required and all fields are filled', () => {
    const container = makeContainer([
      makeFormField({ required: true, value: 'filled' }),
    ]);

    expect(validateFormElement(container, true).valid).toBe(true);
  });
});
