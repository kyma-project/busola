import { validateFormElement } from './validateFormElement';
import { validateMultiCheckboxes } from './validateWidgets';

function makeInput({ required = false, value = '' } = {}) {
  const input = document.createElement('ui5-input');
  input.required = required;
  input.value = value;
  return input;
}

function makeFormField({ required = false, value = '', label = '' } = {}) {
  const field = document.createElement('div');
  field.classList.add('form-field');
  if (label) {
    const lbl = document.createElement('ui5-label');
    lbl.textContent = label;
    field.appendChild(lbl);
  }
  field.appendChild(makeInput({ required, value }));
  return field;
}

function makeSection({
  required = false,
  accessibleName = '',
  children = [],
} = {}) {
  const section = document.createElement('div');
  section.classList.add('resource-form__collapsible-section');
  if (required) section.classList.add('required');
  if (accessibleName) section.setAttribute('accessible-name', accessibleName);
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

describe('validateFormElement — emptyFields and invalidFormatFields', () => {
  it('reports label of an empty required form field', () => {
    const container = makeContainer([
      makeFormField({ required: true, value: '', label: 'My Field' }),
    ]);

    const result = validateFormElement(container, true);
    expect(result.valid).toBe(false);
    expect(result.emptyFields).toContain('My Field');
    expect(result.invalidFormatFields).toHaveLength(0);
  });

  it('uses section name as prefix for nested field names', () => {
    const container = makeContainer([
      makeSection({
        required: true,
        accessibleName: 'Section A',
        children: [
          makeFormField({ required: true, value: '', label: 'Field X' }),
        ],
      }),
    ]);

    const result = validateFormElement(container, true);
    expect(result.emptyFields).toContain('Section A > Field X');
  });

  it('falls back to section name when no specific field names are reported', () => {
    // A form-field without a label: it causes invalid=true but adds nothing to emptyFields
    const container = makeContainer([
      makeSection({
        required: false,
        accessibleName: 'My Section',
        children: [makeFormField({ required: true, value: '' })],
      }),
    ]);

    const result = validateFormElement(container, false);
    expect(result.valid).toBe(false);
    expect(result.emptyFields).toContain('My Section');
    expect(result.invalidFormatFields).toHaveLength(0);
  });

  it('does not add section name fallback when specific field names are already reported', () => {
    const container = makeContainer([
      makeSection({
        required: false,
        accessibleName: 'My Section',
        children: [
          makeFormField({ required: true, value: '', label: 'Inner Field' }),
        ],
      }),
    ]);

    const result = validateFormElement(container, false);
    expect(result.valid).toBe(false);
    expect(result.emptyFields).toContain('My Section > Inner Field');
    expect(result.emptyFields).not.toContain('My Section');
  });
});

describe('validateMultiCheckboxes — label and reason', () => {
  it('returns label from ui5-label when checkbox group is required and empty', () => {
    const field = document.createElement('div');
    field.classList.add('form-field', 'multi-checkbox');
    const lbl = document.createElement('ui5-label');
    lbl.textContent = 'Supported Modes';
    field.appendChild(lbl);
    const checkbox = document.createElement('ui5-checkbox');
    checkbox.checked = false;
    field.appendChild(checkbox);

    const result = validateMultiCheckboxes(field, true);
    expect(result.valid).toBe(false);
    expect(result.label).toBe('Supported Modes');
    expect(result.reason).toBe('empty');
  });

  it('returns valid=true and label when checkbox group is checked', () => {
    const field = document.createElement('div');
    field.classList.add('form-field', 'multi-checkbox');
    const lbl = document.createElement('ui5-label');
    lbl.textContent = 'Supported Modes';
    field.appendChild(lbl);
    const checkbox = document.createElement('ui5-checkbox');
    checkbox.checked = true;
    field.appendChild(checkbox);

    const result = validateMultiCheckboxes(field, true);
    expect(result.valid).toBe(true);
    expect(result.label).toBe('Supported Modes');
  });

  it('returns no label when no ui5-label is present', () => {
    const field = document.createElement('div');
    field.classList.add('form-field', 'multi-checkbox');
    const checkbox = document.createElement('ui5-checkbox');
    field.appendChild(checkbox);

    const result = validateMultiCheckboxes(field, true);
    expect(result.label).toBeUndefined();
  });
});
